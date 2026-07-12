import { Prisma } from "@prisma/client";

export function serializePrisma<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value instanceof Prisma.Decimal) {
        return value.toNumber();
      }

      return value;
    }),
  );
}
