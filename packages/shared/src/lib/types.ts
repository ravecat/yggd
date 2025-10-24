export interface JsonApiResource<T = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: T;
}

export interface JsonApiRelationship {
  data: {
    id: string;
    type: string;
  } | null;
}

export interface PostAttributes {
  title: string;
  content: string;
  author_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Post extends JsonApiResource<PostAttributes> {
  type: 'post';
  relationships: {
    author: JsonApiRelationship;
  };
}

export interface UserAttributes {
  email: string;
}

export interface User extends JsonApiResource<UserAttributes> {
  type: 'user';
}

export interface JsonApiResponse<T> {
  data: T[];
  included?: Array<User | Post>;
  meta?: {
    total?: number;
    page?: number;
  };
}
