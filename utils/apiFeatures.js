class APIFeatures {
  constructor(query, queryString, pageSize, queryPattern) {
    this.query = query;
    this.queryString = queryString;
    this.pageSize = pageSize;
    this.queryPattern = queryPattern;
    this.from = 0;
    this.to = 0;
  }

  filter() {
    // 1) Filter
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    Object.keys(queryObj).forEach((el) => {
      const key = Object.keys(queryObj[el])[0];
      const value = Object.values(queryObj[el])[0];
      if (key === 'eq') {
        this.query = this.query.eq(`${el}`, value);
      } else if (key === 'gt') {
        this.query = this.query.gt(`${el}`, value);
      } else if (key === 'gte') {
        this.query = this.query.gte(`${el}`, value);
      } else if (key === 'lt') {
        this.query = this.query.lt(`${el}`, value);
      } else if (key === 'lte') {
        this.query = this.query.lte(`${el}`, value);
      } else if (key === 'ilike') {
        this.query = this.query.ilike(`${el}`, `%${value}%`);
      } else if (key === 'like') {
        this.query = this.query.like(`${el}`, `%${value}%`);
      }
      return this.query;
    });

    return this;
  }

  sort() {
    // 2) Sort
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',');
      sortBy.forEach((el) => {
        return !el.includes('-')
          ? (this.query = this.query.order(el.replaceAll('+', ''), {
              ascending: true,
            }))
          : (this.query = this.query.order(el.replaceAll('-', ''), {
              ascending: false,
            }));
      });
    } else {
      this.query = this.query.order('id', { ascending: true });
    }

    return this;
  }

  limitFields() {
    // 3) Selected fields
    const fields = this.queryString.fields;
    if (fields) {
      this.query = this.query.select(fields);
    } else if (this.queryPattern) {
      this.query = this.query.select(this.queryPattern);
    } else {
      this.query = this.query.select('*');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    // const limit = this.queryString.limit * 1 || 100;
    // const from = this.queryString.from * 1 || (page - 1) * limit;
    // const to = this.queryString.to * 1 || page * limit - 1;
    this.from = (page - 1) * this.pageSize;
    this.to = page * this.pageSize - 1;
    this.query = this.query.range(this.from, this.to);

    return this;
  }
}

module.exports = APIFeatures;
