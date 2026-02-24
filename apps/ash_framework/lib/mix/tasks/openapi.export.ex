defmodule Mix.Tasks.Openapi.Export do
  @moduledoc """
  Exports the OpenAPI specification to a JSON file.

  ## Usage

      mix openapi.export
      mix openapi.export --output path/to/openapi.json

  Generates the spec from AshJsonApi domains and writes it as pretty-printed JSON.
  Default output: `priv/specs/openapi.json`
  """

  use Mix.Task

  @shortdoc "Export OpenAPI spec to JSON file"
  @requirements ["app.start"]

  @default_output "priv/specs/openapi.json"

  def run(args) do
    {opts, _, _} = OptionParser.parse(args, strict: [output: :string])
    output = Keyword.get(opts, :output, @default_output)

    spec =
      [
        domains: Application.fetch_env!(:ash_framework, :ash_domains),
        phoenix_endpoint: AshFrameworkWeb.Endpoint
      ]
      |> AshJsonApi.OpenApi.spec()
      |> Jason.encode!(pretty: true)

    output |> Path.dirname() |> File.mkdir_p!()
    File.write!(output, spec <> "\n")

    Mix.shell().info("OpenAPI spec exported to #{output}")
  end
end
