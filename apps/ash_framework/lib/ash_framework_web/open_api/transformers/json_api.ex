defmodule AshFrameworkWeb.OpenApi.Transformers.JsonApi do
  alias OpenApiSpex.{Operation, Parameter, PathItem, Schema}

  @operation_methods [:get, :put, :post, :delete, :options, :head, :patch, :trace]
  def transform(spec, _conn, opts) do
    operation_contexts = operation_contexts(opts)
    field_schemas = field_schemas(opts)

    update_in(spec, [Access.key!(:paths)], fn paths ->
      Map.new(paths || %{}, fn {path, path_item} ->
        {path, normalize_path_item(path, path_item, operation_contexts, field_schemas)}
      end)
    end)
  end

  defp normalize_path_item(path, %PathItem{} = path_item, operation_contexts, field_schemas) do
    path_item = normalize_parameters(path_item, :parameters, %{}, field_schemas)

    Enum.reduce(@operation_methods, path_item, fn method, acc ->
      case Map.get(acc, method) do
        %Operation{} = operation ->
          context = Map.get(operation_contexts, {path, method}, %{})
          Map.put(acc, method, normalize_operation(operation, context, field_schemas))

        _ ->
          acc
      end
    end)
  end

  defp normalize_path_item(_path, path_item, _operation_contexts, _field_schemas), do: path_item

  defp normalize_operation(%Operation{} = operation, context, field_schemas) do
    normalize_parameters(operation, :parameters, context, field_schemas)
  end

  defp normalize_parameters(struct, key, context, field_schemas) do
    case Map.fetch(struct, key) do
      {:ok, parameters} when is_list(parameters) ->
        Map.put(
          struct,
          key,
          Enum.map(parameters, &normalize_parameter(&1, context, field_schemas))
        )

      _ ->
        struct
    end
  end

  defp normalize_parameter(
         %Parameter{name: name, schema: %Schema{} = schema} = parameter,
         context,
         field_schemas
       ) do
    case to_string(name) do
      "sort" ->
        %{
          parameter
          | style: :form,
            explode: false,
            schema: comma_separated_array_schema(schema, sort_terms(context))
        }

      "include" ->
        %{
          parameter
          | style: :form,
            explode: false,
            schema: comma_separated_array_schema(schema, include_paths(context))
        }

      "fields" ->
        %{parameter | schema: normalize_fields_schema(schema, field_schemas)}

      _ ->
        parameter
    end
  end

  defp normalize_parameter(parameter, _context, _field_schemas), do: parameter

  defp normalize_fields_schema(%Schema{type: :object} = schema, field_schemas)
       when map_size(field_schemas) > 0 do
    %{
      schema
      | properties: field_schemas,
        additionalProperties: false,
        example: normalize_fields_example(schema.example)
    }
  end

  defp normalize_fields_schema(%Schema{type: :object} = schema, _field_schemas) do
    properties =
      schema.properties
      |> case do
        properties when is_map(properties) ->
          Map.new(properties, fn {key, value} ->
            {key, comma_separated_array_schema(value, [])}
          end)

        _ ->
          %{}
      end

    additional_properties =
      case schema.additionalProperties do
        false ->
          false

        _ ->
          %Schema{
            type: :array,
            items: %Schema{type: :string}
          }
      end

    example =
      case schema.example do
        example when is_map(example) ->
          Map.new(example, fn {key, value} ->
            {key, split_comma_separated_example(value)}
          end)

        _ ->
          schema.example
      end

    %{
      schema
      | properties: properties,
        additionalProperties: additional_properties,
        example: normalize_fields_example(example)
    }
  end

  defp normalize_fields_schema(schema, _field_schemas), do: schema

  defp comma_separated_array_schema(%Schema{type: :array} = schema, values) do
    %{
      schema
      | items: item_schema(schema.items, schema, values),
        example: split_comma_separated_example(schema.example)
    }
  end

  defp comma_separated_array_schema(%Schema{} = schema, values) do
    %{
      schema
      | type: :array,
        items: item_schema(nil, schema, values),
        pattern: nil,
        enum: nil,
        example: split_comma_separated_example(schema.example)
    }
  end

  defp item_schema(%Schema{} = item_schema, _schema, values)
       when is_list(values) and values != [] do
    %{item_schema | type: item_schema.type || :string, enum: values}
  end

  defp item_schema(nil, _schema, values) when is_list(values) and values != [] do
    %Schema{type: :string, enum: values}
  end

  defp item_schema(%Schema{} = item_schema, _schema, _values) do
    %{item_schema | type: item_schema.type || :string}
  end

  defp item_schema(_item_schema, %Schema{enum: enum}, _values) when is_list(enum) do
    %Schema{type: :string, enum: enum}
  end

  defp item_schema(_item_schema, _schema, _values), do: %Schema{type: :string}

  defp split_comma_separated_example(example) when is_binary(example) do
    String.split(example, ",", trim: true)
  end

  defp split_comma_separated_example(example), do: example

  defp normalize_fields_example(example) when is_map(example) do
    Map.new(example, fn {key, value} ->
      {key, split_comma_separated_example(value)}
    end)
  end

  defp normalize_fields_example(example), do: example

  defp operation_contexts(opts) do
    opts
    |> json_api_resources()
    |> Enum.reduce(%{}, fn {resource, domain}, acc ->
      resource
      |> AshJsonApi.Resource.Info.routes(domain)
      |> Enum.reduce(acc, fn route, acc ->
        {path, _query} = AshJsonApi.JsonSchema.route_href(route, domain, opts)
        Map.put(acc, {path, route.method}, %{resource: resource})
      end)
    end)
  end

  defp field_schemas(opts) do
    opts
    |> json_api_resources()
    |> Enum.reduce(%{}, fn {resource, _domain}, acc ->
      Map.put(acc, resource_type(resource), field_selection_schema(resource))
    end)
  end

  defp field_selection_schema(resource) do
    type = resource_type(resource)

    %Schema{
      type: :array,
      description: "Field names for #{type}",
      items: %Schema{
        type: :string,
        enum: field_names(resource)
      },
      example: field_example(resource)
    }
  end

  defp sort_terms(%{resource: resource}) do
    resource
    |> AshJsonApi.JsonSchema.sortable_fields()
    |> Enum.flat_map(fn field ->
      name = to_string(field.name)
      [name, "-" <> name]
    end)
    |> Enum.uniq()
  end

  defp sort_terms(_context), do: []

  defp include_paths(%{resource: resource}) do
    resource
    |> AshJsonApi.Resource.Info.includes()
    |> all_paths()
    |> Enum.map(&Enum.join(&1, "."))
    |> Enum.uniq()
  end

  defp include_paths(_context), do: []

  defp field_names(resource) do
    [
      Ash.Resource.Info.public_attributes(resource),
      Ash.Resource.Info.public_relationships(resource),
      Ash.Resource.Info.public_aggregates(resource),
      Ash.Resource.Info.public_calculations(resource)
    ]
    |> List.flatten()
    |> Enum.map(&to_string(&1.name))
    |> Enum.uniq()
  end

  defp field_example(resource) do
    resource
    |> AshJsonApi.Resource.Info.default_fields()
    |> case do
      nil ->
        resource
        |> Ash.Resource.Info.public_attributes()
        |> Enum.map(&to_string(&1.name))

      fields ->
        Enum.map(fields, &to_string/1)
    end
  end

  defp json_api_resources(opts) do
    opts
    |> domains()
    |> Enum.flat_map(fn domain ->
      domain
      |> Ash.Domain.Info.resources()
      |> Enum.filter(&json_api_resource?/1)
      |> Enum.map(&{&1, domain})
    end)
    |> Enum.uniq()
  end

  defp domains(opts), do: List.wrap(opts[:domain] || opts[:domains])

  defp json_api_resource?(resource) do
    AshJsonApi.Resource in Spark.extensions(resource) and not is_nil(resource_type(resource))
  end

  defp resource_type(resource), do: AshJsonApi.Resource.Info.type(resource)

  defp all_paths(keyword, trail \\ []) do
    keyword
    |> List.wrap()
    |> Enum.flat_map(fn
      {key, rest} ->
        further =
          rest
          |> List.wrap()
          |> all_paths(trail ++ [key])

        [trail ++ [key]] ++ further

      key ->
        [trail ++ [key]]
    end)
  end
end
