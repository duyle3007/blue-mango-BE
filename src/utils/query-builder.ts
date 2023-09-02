export const setProp =
  (key: string, value: any) =>
  (query: Record<string, any> = {}) => {
    if (value !== undefined) {
      return {
        ...query,
        [key]: value,
      };
    }

    return query;
  };

export const queryBuilder = (
  setPropFns: Array<(query: Record<string, any>) => Record<string, any>>,
  initalValue: Record<string, any> = {},
) => {
  return setPropFns.reduce((query, fn) => fn(query), initalValue);
};
