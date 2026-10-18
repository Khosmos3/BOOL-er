let defaultPermutation = makePermutation();

class Rand {
    static random() {
        return Math.random();
    }

    static chance(c) {
        return c > this.random();
    }

    static intRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static range(min, max) {
        return Math.random() * (max - min) + min;
    }

    static choice(arr) {
        return arr[this.intRange(0, arr.length - 1)];
    }

    // static bool(chance = .5) {
    //     return this.random() < chance;
    // }

    static vector() {
        return new Vector(Rand.range(-1, 1), Rand.range(-1, 1))
    }

    static perlin2D(x, y, P = defaultPermutation) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;

        let xf = x - Math.floor(x);
        let yf = y - Math.floor(y);

        let topRight = new Vector(xf - 1.0, yf - 1.0);
        let topLeft = new Vector(xf, yf - 1.0);
        let bottomRight = new Vector(xf - 1.0, yf);
        let bottomLeft = new Vector(xf, yf);

        let valueTopRight = P[P[X + 1] + Y + 1];
        let valueTopLeft = P[P[X] + Y + 1];
        let valueBottomRight = P[P[X + 1] + Y];
        let valueBottomLeft = P[P[X] + Y];

        let dotTopRight = topRight.dot(Vector.getConstantVector(valueTopRight));
        let dotTopLeft = topLeft.dot(Vector.getConstantVector(valueTopLeft));
        let dotBottomRight = bottomRight.dot(Vector.getConstantVector(valueBottomRight));
        let dotBottomLeft = bottomLeft.dot(Vector.getConstantVector(valueBottomLeft));

        let u = fade(xf);
        let v = fade(yf);

        return lerp(lerp(dotBottomLeft, dotTopLeft, v), lerp(dotBottomRight, dotTopRight, v), u)
    }

    static perlin3D(x, y, z, parameters = {}) {
        let octaves = parameters.octaves ?? 1;
        let lacunarity = parameters.lacunarity ?? 2;
        let persistence = parameters.persistence ?? 0.5;
        let permutation = parameters.permutation ?? defaultPermutation;
        return this._perlin3D(0, x, y, z, octaves, octaves, permutation, lacunarity, persistence);
    }

    static _perlin3D(p, x, y, z, currentOctave, totalOctaves, P, lacunarity, persistence) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;
        let Z = Math.floor(z) & 255;

        let xf = x - Math.floor(x);
        let yf = y - Math.floor(y);
        let zf = z - Math.floor(z);

        let lowerTopRight = new Vector3D(xf - 1.0, yf - 1.0, zf);
        let lowerTopLeft = new Vector3D(xf, yf - 1.0, zf);
        let lowerBottomRight = new Vector3D(xf - 1.0, yf, zf);
        let lowerBottomLeft = new Vector3D(xf, yf, zf);
        let upperTopRight = new Vector3D(xf - 1.0, yf - 1.0, zf - 1.0);
        let upperTopLeft = new Vector3D(xf, yf - 1.0, zf - 1.0);
        let upperBottomRight = new Vector3D(xf - 1.0, yf, zf - 1.0);
        let upperBottomLeft = new Vector3D(xf, yf, zf - 1.0);

        let valueLowerTopRight = P[P[P[X + 1] + Y + 1] + Z];
        let valueLowerTopLeft = P[P[P[X] + Y + 1] + Z];
        let valueLowerBottomRight = P[P[P[X + 1] + Y] + Z];
        let valueLowerBottomLeft = P[P[P[X] + Y] + Z];
        let valueUpperTopRight = P[P[P[X + 1] + Y + 1] + Z + 1];
        let valueUpperTopLeft = P[P[P[X] + Y + 1] + Z + 1];
        let valueUpperBottomRight = P[P[P[X + 1] + Y] + Z + 1];
        let valueUpperBottomLeft = P[P[P[X] + Y] + Z + 1];

        let dotLowerTopRight = lowerTopRight.dot(Vector3D.getConstantVector(valueLowerTopRight));
        let dotLowerTopLeft = lowerTopLeft.dot(Vector3D.getConstantVector(valueLowerTopLeft));
        let dotLowerBottomRight = lowerBottomRight.dot(Vector3D.getConstantVector(valueLowerBottomRight));
        let dotLowerBottomLeft = lowerBottomLeft.dot(Vector3D.getConstantVector(valueLowerBottomLeft));
        let dotUpperTopRight = upperTopRight.dot(Vector3D.getConstantVector(valueUpperTopRight));
        let dotUpperTopLeft = upperTopLeft.dot(Vector3D.getConstantVector(valueUpperTopLeft));
        let dotUpperBottomRight = upperBottomRight.dot(Vector3D.getConstantVector(valueUpperBottomRight));
        let dotUpperBottomLeft = upperBottomLeft.dot(Vector3D.getConstantVector(valueUpperBottomLeft));

        let u = fade(xf);
        let v = fade(yf);
        let w = fade(zf);

        p += Math.pow(persistence, totalOctaves - currentOctave) * lerp(
            lerp(lerp(dotLowerBottomLeft, dotLowerTopLeft, v), lerp(dotLowerBottomRight, dotLowerTopRight, v), u),
            lerp(lerp(dotUpperBottomLeft, dotUpperTopLeft, v), lerp(dotUpperBottomRight, dotUpperTopRight, v), u),
            w
        );

        if (currentOctave > 1)
            return this._perlin3D(p, lacunarity*x, lacunarity*y, z, currentOctave - 1, totalOctaves, P, lacunarity, persistence);
        else return p;
    }

    static octave(paramsInput, paramsOther, noiseFunction, n, persistence = 0.5, lacunarity = 2) {
        let p = 0;
        let amplitude = 1;
        let frequency = 1;
        for (let i = 0; i < n; i++) {
            p += amplitude*noiseFunction(...paramsInput.map(p => p*frequency), ...paramsOther);
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return p;
    }
}

class Vector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get sqMag() {
        return x ** 2 + y ** 2 + z ** 2;
    }

    get mag() {
        return Math.hypot(this.x, this.y, this.z);
    }

    get normalized() {
        return new Vector3D(this.x / this.mag, this.y / this.mag, this.z / this.mag)
    }

    static getConstantVector(v) {
        let _v = v & 7;
        if (_v == 0) return new Vector3D(1, 1, 1)
        else if (_v == 1) return new Vector3D(-1, 1, 1)
        else if (_v == 2) return new Vector3D(1, -1, 1)
        else if (_v == 3) return new Vector3D(1, 1, -1)
        else if (_v == 4) return new Vector3D(-1, -1, 1)
        else if (_v == 5) return new Vector3D(1, -1, -1)
        else if (_v == 6) return new Vector3D(-1, 1, -1)
        else return new Vector3D(-1,-1, -1)
    }

    copy(v = new Vector()) {
        v.x = this.x;
        v.y = this.y;
        v.z = this.z;
        return v;
    }

    invert() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    normalize() {
        this.div(this.mag);
        return this;
    }

    equals(v) {
        const EPS = 1e-6;
        return Math.abs(this.x - v.x) < EPS && Math.abs(this.y - v.y) < EPS && Math.abs(this.z - v.z) < EPS;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    toString() {
        return `⟨${this.x}, ${this.y}, ${this.z}⟩`;
    }

    // +=, -=, *=, /=

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    mul(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    div(s) {
        return this.mul(1 / s);
    }

    // +, -, *, /

    plus(v) {
        return this.copy().add(v);
    }

    minus(v) {
        return this.copy().sub(v);
    }

    times(s) {
        return this.copy().mul(s);
    }

    over(s) {
        return this.copy().div(s);
    }
}


class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get sqMag() {
        return x ** 2 + y ** 2;
    }

    get mag() {
        return Math.hypot(this.x, this.y);
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    get inverse() {
        return this.copy().invert();
    }

    get leftNormal() {
        return new Vector(-this.y, this.x);
    }

    get rightNormal() {
        return new Vector(this.y, -this.x);
    }

    get normalized() {
        return new Vector(this.x / this.mag, this.y / this.mag)
    }

    static getConstantVector(v) {
        let _v = v & 3;
        if (_v == 0) return new Vector(1, 1)
        else if (_v == 1) return new Vector(-1, 1)
        else if (_v == 2) return new Vector(-1, -1)
        else return new Vector(1, -1)
    }

    rotate(angle) {
        let oldX = this.x;
        let oldY = this.y ;
        this.x = oldX*Math.cos(angle) - oldY*Math.sin(angle)
        this.y = oldX*Math.sin(angle) + oldY*Math.cos(angle)
    }

    copy(v = new Vector()) {
        v.x = this.x;
        v.y = this.y;
        return v;
    }

    invert() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    normalize() {
        this.div(this.mag);
        return this;
    }

    equals(v) {
        const EPS = 1e-6;
        return Math.abs(this.x - v.x) < EPS && Math.abs(this.y - v.y) < EPS;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    toString() {
        return `⟨${this.x}, ${this.y}⟩`;
    }

    // +=, -=, *=, /=

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mul(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    div(s) {
        return this.mul(1 / s);
    }

    // +, -, *, /

    plus(v) {
        return this.copy().add(v);
    }

    minus(v) {
        return this.copy().sub(v);
    }

    times(s) {
        return this.copy().mul(s);
    }

    over(s) {
        return this.copy().div(s);
    }
}

function lerp(a1, a2, t) {
    return a1 + t * (a2 - a1);
}

function clamp(n, min, max) {
    return Math.max(Math.min(n, max), min);
}

function fade(t) {
    return ((6 * t - 15) * t + 10) * t * t * t;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let index = Math.round(Math.random() * (i - 1)),
            temp = arr[i];

        arr[i] = arr[index];
        arr[index] = temp;
    }
}

function remap(n, pMin, pMax, min, max) {
    return ((n - pMin)/(pMax - pMin))*(max - min) + min;
}

function makePermutation() {
    let P = [];
    for (let i = 0; i < 256; i++) {
        P.push(i);
    }
    shuffle(P);
    for (let i = 0; i < 256; i++) {
        P.push(P[i]);
    }

    return P;
}
