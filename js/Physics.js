(function (sCape) {
	if (typeof(sCape) == 'undefined') {
		throw "sCape is needed to use the Entities module";
	}

	sCape.Physics = {
		areRectanglesColliding: function (rect1, rect2) {
			return rect1.x < rect2.x + rect2.w
				&& rect1.x + rect1.w > rect2.x
				&& rect1.y < rect2.y + rect2.h
				&& rect1.y + rect1.h > rect2.y
		},

		areSegmentAndRectangleColliding: function (line, rect) {
			var minX, maxX,
				minY, maxY,
				tmp,
				dx,
				a, b,
				p1 = line.p1, p2 = line.p2,
				MathMin = Math.min, MathMax = Math.max;

			// minX is the right most point between the left most point of the segment
			// and the left coordinate of the rectangle
			minX = MathMax(rect.x, MathMin(p1.x, p2.x));
			// maxX is the left most point between the right most point of the segment
			// and the right coordinate of the rectangle
			maxX = MathMin(rect.x + rect.w, MathMax(p1.x, p2.x));

			// the segment is completely on the left of the rectangle or completely on
			// the right of the rectangle, no collision
			if (minX > maxX) {
				return false;
			}

			// Here, [minX, maxX] is the interval of collision of the projection on the
			// X axis of the segment and the projection on the X axis of the rectangle

			// x-length of the segment
			dx = p2.x - p1.x;

			minY = p1.y;
			maxY = p2.y;
			// if segment not vertical, get its equation
			if (Math.abs(dx) > 0.0000001) {
				a = (p2.y - p1.y) / dx;
				b = p1.y - a * p1.x;
				// The segment has for equation y = ax + b
				// get the segment coordinate on the part which is colliding on the
				// projection on X
				minY = a * minX + b;
				maxY = a * maxX + b;
			}

			// minY is the bottom most point between the top most point of the segment
			// and the top coordinate of the rectangle
			// maxY is the top most point between the bottom most point of the segment
			// and the bottom coordinate of the rectangle
			// Here, [minY, maxY] is the interval of collision of the projection on the
			// Y axis of the segment and the projection on the Y axis of the rectangle
			// if minY > maxY, the interval is null, and so there is no collision
			return MathMax(rect.y, MathMin(minY, maxY)) <= MathMin(rect.y + rect.h, MathMax(minY, maxY));
		}
	};

})(sCape);
