defmodule AshFrameworkWeb.AshTypescriptRpcController do
  use AshFrameworkWeb, :controller

  def run(conn, params) do
    result = AshTypescript.Rpc.run_action(:ash_framework, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    result = AshTypescript.Rpc.validate_action(:ash_framework, conn, params)
    json(conn, result)
  end
end
