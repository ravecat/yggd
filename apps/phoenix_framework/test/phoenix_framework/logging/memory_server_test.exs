defmodule PhoenixFramework.Logging.MemoryServerTest do
  use ExUnit.Case, async: true

  alias PhoenixFramework.Logging.MemoryServer

  setup do
    server = start_supervised!({MemoryServer, [name: nil]})
    %{server: server}
  end

  test "stores log entries in insertion order", %{server: server} do
    assert {:ok, first} = MemoryServer.append(server, "first")
    assert {:ok, second} = MemoryServer.append(server, "second")

    assert [stored_first, stored_second] = MemoryServer.latest(server)
    assert stored_first == first
    assert stored_second == second
  end

  test "keeps only the last 10 log entries", %{server: server} do
    entries =
      for index <- 1..12 do
        {:ok, entry} = MemoryServer.append(server, "log-#{index}")
        entry
      end

    expected_messages =
      entries
      |> Enum.take(-10)
      |> Enum.map(& &1.message)

    actual_messages = Enum.map(MemoryServer.latest(server), & &1.message)

    assert actual_messages == expected_messages
  end

  test "supports returning a smaller subset of recent entries", %{server: server} do
    for message <- ["one", "two", "three", "four"] do
      assert {:ok, _entry} = MemoryServer.append(server, message)
    end

    assert [%{message: "three"}, %{message: "four"}] = MemoryServer.latest(server, 2)
  end

  test "rejects empty and non-binary messages", %{server: server} do
    assert {:error, :invalid_message} = MemoryServer.append(server, "")
    assert {:error, :invalid_message} = MemoryServer.append(server, nil)
  end

  test "rejects non-positive limits", %{server: server} do
    assert {:error, :invalid_limit} = MemoryServer.latest(server, 0)
    assert {:error, :invalid_limit} = MemoryServer.latest(server, -1)
  end
end
