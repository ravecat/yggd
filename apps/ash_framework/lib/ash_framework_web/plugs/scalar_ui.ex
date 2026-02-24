defmodule AshFrameworkWeb.Plugs.ScalarUI do
  @behaviour Plug

  @impl true
  def init(opts) do
    %{spec_url: Keyword.fetch!(opts, :spec_url)}
  end

  @impl true
  def call(conn, %{spec_url: spec_url}) do
    html = """
    <!doctype html>
    <html>
      <head>
        <title>API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.44.20"></script>
        <script>
          Scalar.createApiReference('body', { url: '#{spec_url}', theme: 'default' })
        </script>
      </body>
    </html>
    """

    conn
    |> Plug.Conn.put_resp_content_type("text/html")
    |> Plug.Conn.send_resp(200, html)
  end
end
