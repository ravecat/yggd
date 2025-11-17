defmodule PhoenixFramework.Yjs.Schema do
  use Ecto.Schema
  import Ecto.Changeset

  schema "yjs_records" do
    field :value, :binary
    field :version, Ecto.Enum, values: [:v1, :v1_sv]
    field :doc_name, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(yjs_records, attrs) do
    yjs_records
    |> cast(attrs, [:doc_name, :value, :version])
    |> validate_required([:doc_name, :value, :version])
  end
end
