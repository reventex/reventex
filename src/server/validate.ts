import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { isRight } from "fp-ts/lib/Either";

function validate<T extends t.Type<any>>(
  schema: T,
  params: any,
  errorName?: string
): t.TypeOf<T> {
  const validationResult = schema.decode(params);
  if (!isRight(validationResult)) {
    const messages = PathReporter.report(validationResult);
    const error = new Error(messages.join("\n"));
    if (errorName != null) {
      error.name = errorName;
    }
    throw error;
  }
  return params;
}

export default validate;
