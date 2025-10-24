defmodule AshFramework.Blog do
  use Ash.Domain,
    otp_app: :ash_framework,
    extensions: [AshAdmin.Domain, AshJsonApi.Domain, AshTypescript.Rpc]

  admin do
    show? true
  end

  json_api do
    router AshJsonApi.Domain.Router
    show_raised_errors? true
  end

  typescript_rpc do
    resource AshFramework.Blog.Post do
      rpc_action :list_posts, :read
      rpc_action :create_post, :create
      rpc_action :update_post, :update
    end
  end

  resources do
    resource AshFramework.Blog.Post
  end
end
