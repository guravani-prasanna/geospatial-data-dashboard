export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x < this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y < this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

export class Quadtree {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northeast.insert(point) ||
      this.northwest.insert(point) ||
      this.southeast.insert(point) ||
      this.southwest.insert(point)
    );
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;

    this.northeast = new Quadtree(
      new Rectangle(x + w, y - h, w, h),
      this.capacity,
    );
    this.northwest = new Quadtree(
      new Rectangle(x - w, y - h, w, h),
      this.capacity,
    );
    this.southeast = new Quadtree(
      new Rectangle(x + w, y + h, w, h),
      this.capacity,
    );
    this.southwest = new Quadtree(
      new Rectangle(x - w, y + h, w, h),
      this.capacity,
    );

    this.divided = true;
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (let p of this.points) {
      if (range.contains(p)) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }

  getPointCount() {
    let count = this.points.length;
    if (this.divided) {
      count += this.northeast.getPointCount();
      count += this.northwest.getPointCount();
      count += this.southeast.getPointCount();
      count += this.southwest.getPointCount();
    }
    return count;
  }
}
