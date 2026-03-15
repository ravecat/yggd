import { createQueryCodec, getTodosQueryParamsSchema } from "@rvct/shared";

export const todosQueryCodec = createQueryCodec(getTodosQueryParamsSchema);
