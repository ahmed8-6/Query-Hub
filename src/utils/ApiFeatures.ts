interface QueryLike {
  find(filter: Record<string, unknown>): QueryLike;
  sort(sortBy: string): QueryLike;
  select(fields: string): QueryLike;
  skip(value: number): QueryLike;
  limit(value: number): QueryLike;
}

interface QueryStringParams extends Record<string, unknown> {
  sort?: string;
  fields?: string;
  page?: string | number;
  limit?: string | number;
  date_from?: string;
  date_till?: string;
  q?: string;
  tag?: string;
  author?: string;
  status?: string;
}

interface DateRange {
  $gte?: Date;
  $lte?: Date;
}

class ApiFeatures<TQuery extends QueryLike> {
  query: TQuery;
  queryStr: QueryStringParams;

  constructor(query: TQuery, queryStr: QueryStringParams) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search(): this {
    const searchFilter: Record<string, unknown> = {};

    if (typeof this.queryStr.q === "string" && this.queryStr.q.trim()) {
      searchFilter.$text = { $search: this.queryStr.q.trim() };
    }

    if (typeof this.queryStr.tag === "string" && this.queryStr.tag.trim()) {
      searchFilter.tags = this.queryStr.tag.toLowerCase().trim();
    }

    if (
      typeof this.queryStr.author === "string" &&
      this.queryStr.author.trim()
    ) {
      searchFilter.author = this.queryStr.author.trim();
    }

    if (
      typeof this.queryStr.status === "string" &&
      this.queryStr.status.trim()
    ) {
      searchFilter.status = this.queryStr.status.trim();
    }

    if (Object.keys(searchFilter).length > 0) {
      this.query = this.query.find(searchFilter) as TQuery;
    }

    return this;
  }

  filter(): this {
    let queryString = JSON.stringify(this.queryStr);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    const queryObj = JSON.parse(queryString) as Record<string, unknown>;
    const dateRange: DateRange = {};

    if (typeof queryObj.date_from === "string") {
      dateRange.$gte = new Date(queryObj.date_from);
    }

    if (typeof queryObj.date_till === "string") {
      dateRange.$lte = new Date(queryObj.date_till);
      dateRange.$lte.setHours(23, 59, 59, 999);
    }

    const excludeFields = [
      "date_from",
      "date_till",
      "q",
      "tag",
      "author",
      "status",
      "sort",
      "fields",
      "page",
      "limit",
    ];
    excludeFields.forEach((field) => delete queryObj[field]);

    if (Object.keys(dateRange).length > 0) {
      queryObj.date_from = dateRange;
    }

    if (Object.keys(queryObj).length > 0) {
      this.query = this.query.find(queryObj) as TQuery;
    }

    return this;
  }

  sort(): this {
    if (
      typeof this.queryStr.sort === "string" &&
      this.queryStr.sort.length > 0
    ) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy) as TQuery;
    } else {
      if (typeof this.queryStr.q === "string" && this.queryStr.q.trim()) {
        this.query = this.query.sort({
          score: { $meta: "textScore" },
        } as any) as TQuery;
      } else {
        this.query = this.query.sort("-createdAt") as TQuery;
      }
    }
    return this;
  }

  limitFields(): this {
    if (
      typeof this.queryStr.fields === "string" &&
      this.queryStr.fields.length > 0
    ) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields) as TQuery;
    } else {
      this.query = this.query.select("-__v -editHistory") as TQuery;
    }
    return this;
  }

  paginate(): this {
    const page = Math.max(1, Number(this.queryStr.page) || 1);
    const limit = Math.min(50, Number(this.queryStr.limit) || 10);
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit) as TQuery;
    return this;
  }
}

export default ApiFeatures;
