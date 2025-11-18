defmodule PhoenixFramework.MyYEcto do
  use PhoenixFramework.Yjs.Ecto, repo: PhoenixFramework.Repo, schema: PhoenixFramework.Yjs.Schema
end

defmodule PhoenixFramework.Yjs.Persistence do
  @behaviour Yex.Sync.SharedDoc.PersistenceBehaviour
  require Logger

  @impl true
  def bind(_state, doc_name, doc) do
    Logger.info("[YJS:Persistence] Binding document: #{doc_name}")
    ecto_doc = PhoenixFramework.MyYEcto.get_y_doc(doc_name)

    {:ok, new_updates} = Yex.encode_state_as_update(doc)
    PhoenixFramework.MyYEcto.insert_update(doc_name, new_updates)

    state_update = Yex.encode_state_as_update!(ecto_doc)
    Logger.info("[YJS:Persistence] Loaded document state, size: #{byte_size(state_update)} bytes")

    Yex.apply_update(doc, state_update)
  end

  @impl true
  def unbind(_state, _doc_name, _doc) do
  end

  @impl true
  def update_v1(_state, update, doc_name, _doc) do
    Logger.info("[YJS:Persistence] Saving update for #{doc_name}, size: #{byte_size(update)} bytes")
    PhoenixFramework.MyYEcto.insert_update(doc_name, update)
    :ok
  end
end
