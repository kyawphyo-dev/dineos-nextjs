import { NextResponse } from "next/server";
import { ZodError } from "zod";

const successResponse = (data: unknown, status: number) => {
  return NextResponse.json(
    {
      data,
      message: "Success",
    },
    { status },
  );
};

const errorResponse = (error: unknown, statu: number) => {
  let status = statu || 500;
  let message =
    error instanceof Error ? error.message : "Something went wrong!";
  let details = null;

  if (error instanceof ZodError) {
    message = "Validation Error";
    details = error.flatten().fieldErrors;
    status = 400;
  }

  return NextResponse.json(
    {
      success: false,
      message,
      status,
      details,
    },
    { status },
  );
};

const errorAction = (error: unknown) => {
  let message =
    error instanceof Error ? error.message : "Something went wrong!";
  let details = null;

  if (error instanceof ZodError) {
    message = error.issues.map((issue) => issue.message).join(", ");
    details = error.flatten().fieldErrors;
  }

  return {
    success: false as const,
    message,
    details,
  };
};

export { successResponse, errorResponse, errorAction };
