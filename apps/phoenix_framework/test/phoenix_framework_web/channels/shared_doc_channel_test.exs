defmodule PhoenixFrameworkWeb.SharedDocChannelTest do
  use PhoenixFrameworkWeb.ChannelCase

  alias PhoenixFrameworkWeb.SharedDocChannel
  alias PhoenixFrameworkWeb.SharedDocServer
  alias Yex.Sync.SharedDoc

  describe "join/3" do
    test "successfully joins channel when doc server is available" do
      doc_name = "test_doc"
      doc_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      assert socket.assigns.doc_name == doc_name
      assert socket.assigns.doc_pid == doc_pid
    end

    test "returns error when doc server lookup fails" do
      doc_name = "failing_doc"

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:error, :server_unavailable}
      end)

      result =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      assert {:error, %{reason: "failed to initialize document"}} = result
    end

    test "returns error when registry fails to start process" do
      doc_name = "registry_error_doc"

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:error, :cannot_start_process}
      end)

      result =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      assert {:error, %{reason: "failed to initialize document"}} = result
    end
  end

  describe "handle_in/3 for yjs_sync messages" do
    test "forwards binary sync message to SharedDoc.start_sync" do
      doc_name = "sync_test_doc"
      doc_pid = self()
      binary_chunk = <<1, 2, 3, 4>>
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :start_sync, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:start_sync_called, chunk})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      push(socket, "yjs_sync", {:binary, binary_chunk})

      assert_receive {:start_sync_called, ^binary_chunk}
    end

    test "handles multiple sync messages sequentially" do
      doc_name = "multi_sync_doc"
      doc_pid = self()
      chunk1 = <<1, 2>>
      chunk2 = <<3, 4>>
      chunk3 = <<5, 6>>
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :start_sync, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:sync_chunk, chunk})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      push(socket, "yjs_sync", {:binary, chunk1})
      push(socket, "yjs_sync", {:binary, chunk2})
      push(socket, "yjs_sync", {:binary, chunk3})

      assert_receive {:sync_chunk, ^chunk1}
      assert_receive {:sync_chunk, ^chunk2}
      assert_receive {:sync_chunk, ^chunk3}
    end
  end

  describe "handle_in/3 for yjs messages" do
    test "forwards binary yjs message to SharedDoc.send_yjs_message" do
      doc_name = "yjs_message_doc"
      doc_pid = self()
      binary_chunk = <<10, 20, 30>>
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :send_yjs_message, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:yjs_message_sent, chunk})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      push(socket, "yjs", {:binary, binary_chunk})

      assert_receive {:yjs_message_sent, ^binary_chunk}
    end

    test "handles large binary yjs messages" do
      doc_name = "large_yjs_doc"
      doc_pid = self()
      large_chunk = :crypto.strong_rand_bytes(1024)
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :send_yjs_message, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:large_message, byte_size(chunk)})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      push(socket, "yjs", {:binary, large_chunk})

      assert_receive {:large_message, 1024}
    end

    test "handles multiple yjs messages from same client" do
      doc_name = "multi_yjs_doc"
      doc_pid = self()
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :send_yjs_message, [mode: :shared], fn ^doc_pid, msg ->
        send(test_pid, {:yjs_msg, msg})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      push(socket, "yjs", {:binary, <<1>>})
      push(socket, "yjs", {:binary, <<2>>})
      push(socket, "yjs", {:binary, <<3>>})

      assert_receive {:yjs_msg, <<1>>}
      assert_receive {:yjs_msg, <<2>>}
      assert_receive {:yjs_msg, <<3>>}
    end
  end

  describe "handle_info/2 for yjs messages" do
    test "pushes yjs message from SharedDoc to client" do
      doc_name = "info_test_doc"
      doc_pid = self()
      yjs_message = <<100, 200>>

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      send(socket.channel_pid, {:yjs, yjs_message, doc_pid})

      assert_push("yjs", {:binary, ^yjs_message})
    end

    test "pushes multiple yjs messages to client" do
      doc_name = "multi_info_doc"
      doc_pid = self()
      msg1 = <<1, 1, 1>>
      msg2 = <<2, 2, 2>>
      msg3 = <<3, 3, 3>>

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      send(socket.channel_pid, {:yjs, msg1, doc_pid})
      send(socket.channel_pid, {:yjs, msg2, doc_pid})
      send(socket.channel_pid, {:yjs, msg3, doc_pid})

      assert_push("yjs", {:binary, ^msg1})
      assert_push("yjs", {:binary, ^msg2})
      assert_push("yjs", {:binary, ^msg3})
    end

    test "handles yjs messages from different processes" do
      doc_name = "different_proc_doc"
      doc_pid = self()
      other_pid = spawn(fn -> :timer.sleep(:infinity) end)
      message_from_doc = <<11, 22>>
      message_from_other = <<33, 44>>

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      send(socket.channel_pid, {:yjs, message_from_doc, doc_pid})
      send(socket.channel_pid, {:yjs, message_from_other, other_pid})

      assert_push("yjs", {:binary, ^message_from_doc})
      assert_push("yjs", {:binary, ^message_from_other})

      Process.exit(other_pid, :kill)
    end
  end

  describe "terminate/2" do
    test "handles channel termination gracefully" do
      doc_name = "terminate_doc"
      doc_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      ref = Process.monitor(socket.channel_pid)

      Process.flag(:trap_exit, true)
      close(socket)

      assert_receive {:DOWN, ^ref, :process, _, {:shutdown, :closed}}
    end
  end

  describe "integration scenarios" do
    test "full sync workflow: join, sync, receive updates, leave" do
      doc_name = "full_workflow_doc"
      doc_pid = self()
      sync_chunk = <<5, 10, 15>>
      yjs_chunk = <<20, 25, 30>>
      update_message = <<35, 40, 45>>
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :start_sync, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:sync_received, chunk})
        :ok
      end)

      Repatch.patch(SharedDoc, :send_yjs_message, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:yjs_received, chunk})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      push(socket, "yjs_sync", {:binary, sync_chunk})
      assert_receive {:sync_received, ^sync_chunk}

      push(socket, "yjs", {:binary, yjs_chunk})
      assert_receive {:yjs_received, ^yjs_chunk}

      send(socket.channel_pid, {:yjs, update_message, doc_pid})
      assert_push("yjs", {:binary, ^update_message})

      ref = Process.monitor(socket.channel_pid)

      Process.flag(:trap_exit, true)
      close(socket)

      assert_receive {:DOWN, ^ref, :process, _, {:shutdown, :closed}}
    end

    test "handles concurrent messages from multiple operations" do
      doc_name = "concurrent_doc"
      doc_pid = self()
      test_pid = self()

      Repatch.patch(SharedDocServer, :lookup_doc_server, [mode: :shared], fn ^doc_name ->
        {:ok, doc_pid}
      end)

      Repatch.patch(SharedDoc, :observe, [mode: :shared], fn ^doc_pid ->
        :ok
      end)

      Repatch.patch(SharedDoc, :start_sync, [mode: :shared], fn ^doc_pid, chunk ->
        send(test_pid, {:sync, chunk})
        :ok
      end)

      Repatch.patch(SharedDoc, :send_yjs_message, [mode: :shared], fn ^doc_pid, msg ->
        send(test_pid, {:yjs, msg})
        :ok
      end)

      {:ok, _reply, socket} =
        PhoenixFrameworkWeb.UserSocket
        |> socket("user_id", %{})
        |> subscribe_and_join(SharedDocChannel, "y_doc_room:#{doc_name}")

      for i <- 1..3 do
        push(socket, "yjs_sync", {:binary, <<i>>})
        push(socket, "yjs", {:binary, <<i + 10>>})
        send(socket.channel_pid, {:yjs, <<i + 20>>, doc_pid})
      end

      for i <- 1..3 do
        assert_receive {:sync, <<^i>>}
        assert_receive {:yjs, <<_::8>>}
        expected = <<i + 20>>
        assert_push("yjs", {:binary, ^expected})
      end
    end
  end
end
