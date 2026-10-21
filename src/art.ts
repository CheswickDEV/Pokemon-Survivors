/** Original, code-drawn prototype artwork. No source-game or downloaded artwork. */
type Point = readonly [number, number];
const P = {
  ink: '#273830', deep: '#234b3b', forest: '#376344', leaf: '#557b46', light: '#7f9a55',
  lime: '#b2bc70', gold: '#e3bd65', cream: '#f5e4b0', white: '#fff7d8',
  teal: '#6fba9c', tealDark: '#448a7c', cyan: '#91d5be', blue: '#7caec3',
  red: '#d65b55', pink: '#e68b92', purple: '#987baf', orange: '#e19b51',
  wood: '#8b6543', bark: '#624c36', stone: '#98a08c', grey: '#5c736d',
};

/** A tiny raster painter keeps every contour on the same logical pixel grid. */
class PixelPainter {
  constructor(readonly c: CanvasRenderingContext2D) {}
  rect(x: number, y: number, w: number, h: number, color: string) {
    this.c.fillStyle = color;
    this.c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, color: string) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const d = (y + 0.5 - cy) / ry;
      if (Math.abs(d) > 1) continue;
      const span = Math.sqrt(1 - d * d) * rx;
      const x = Math.ceil(cx - span - 0.5);
      this.rect(x, y, Math.floor(cx + span - 0.5) - x + 1, 1, color);
    }
  }
  polygon(points: readonly Point[], color: string) {
    const minY = Math.floor(Math.min(...points.map(p => p[1])));
    const maxY = Math.ceil(Math.max(...points.map(p => p[1])));
    for (let y = minY; y < maxY; y++) {
      const intersections: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i]; const b = points[(i + 1) % points.length];
        if ((a[1] <= y + 0.5 && b[1] > y + 0.5) || (b[1] <= y + 0.5 && a[1] > y + 0.5)) {
          intersections.push(a[0] + (y + 0.5 - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
      }
      intersections.sort((a, b) => a - b);
      for (let i = 0; i + 1 < intersections.length; i += 2) {
        const x = Math.ceil(intersections[i] - 0.5);
        this.rect(x, y, Math.ceil(intersections[i + 1] - 0.5) - x, 1, color);
      }
    }
  }
  body(cx: number, cy: number, rx: number, ry: number, color: string) {
    this.ellipse(cx, cy, rx, ry, P.ink);
    this.ellipse(cx, cy - 0.5, Math.max(0.5, rx - 1), Math.max(0.5, ry - 1), color);
  }
  eye(x: number, y: number) {
    this.rect(x, y, 2, 3, P.ink);
    this.rect(x, y, 1, 1, P.white);
  }
  shadow(cx = 12, cy = 21, rx = 8) {
    this.ellipse(cx, cy, rx, 2, '#172f292e');
  }
}

function surface(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return canvas;
}

function creature(g: PixelPainter, id: number) {
  g.shadow();
  if (id >= 1 && id <= 3) {
    const body = id === 3 ? P.tealDark : P.teal;
    g.body(11, 16, 8, 5, body);
    g.rect(5, 19, 3, 3, P.ink); g.rect(6, 19, 2, 2, body);
    g.rect(14, 19, 3, 3, P.ink); g.rect(14, 19, 2, 2, body);
    g.body(15, 14, 6, 5, body);
    g.polygon([[10, 11], [10, 7], [14, 10]], P.ink);
    g.polygon([[17, 10], [20, 7], [21, 13]], P.ink);
    g.rect(11, 10, 2, 2, body); g.rect(18, 10, 2, 2, body);
    g.eye(13, 13); g.eye(18, 13);
    g.rect(16, 17, 2, 1, P.deep);
    g.rect(5, 15, 2, 2, P.tealDark); g.rect(10, 18, 2, 1, P.tealDark);
    if (id === 1) {
      g.polygon([[2, 10], [4, 5], [8, 4], [12, 9], [10, 13], [4, 13]], P.ink);
      g.polygon([[3, 10], [5, 6], [8, 5], [11, 9], [9, 12], [4, 12]], P.leaf);
      g.polygon([[6, 6], [7, 11], [5, 10]], P.light); g.rect(8, 7, 1, 4, P.deep);
    } else {
      g.polygon([[1, 8], [7, 9], [3, 4], [9, 7], [12, 4], [13, 9], [19, 8], [14, 13], [5, 13]], P.deep);
      g.polygon([[2, 8], [9, 10], [6, 6], [11, 8], [12, 6], [13, 11], [17, 9], [14, 12], [5, 12]], P.leaf);
      if (id === 2) {
        g.body(9, 6, 4, 4, P.red); g.rect(8, 3, 1, 4, P.pink);
      } else {
        for (const [x, y] of [[5, 5], [10, 3], [15, 5], [14, 8], [6, 8]]) g.body(x, y, 4, 3, P.pink);
        g.body(10, 6, 3, 2, P.gold); g.rect(9, 5, 2, 1, P.cream);
      }
    }
  } else if (id >= 4 && id <= 6) {
    const body = id === 5 ? '#cf6d4d' : P.orange;
    g.polygon([[15, 15], [19, 19], [22, 15], [23, 17], [20, 22], [15, 20]], P.ink);
    g.polygon([[16, 16], [19, 20], [22, 17], [20, 21], [15, 19]], body);
    g.polygon([[19, 16], [20, 11], [22, 13], [23, 9], [24, 15], [22, 18]], P.red);
    g.polygon([[21, 16], [22, 13], [23, 16], [22, 17]], P.gold);
    if (id === 6) {
      g.polygon([[9, 11], [2, 5], [1, 15], [5, 12], [8, 17]], P.ink);
      g.polygon([[15, 11], [21, 5], [23, 15], [19, 13], [16, 18]], P.ink);
      g.polygon([[8, 12], [3, 7], [3, 13], [5, 11], [8, 16]], P.tealDark);
      g.polygon([[16, 12], [20, 7], [22, 13], [19, 11], [17, 16]], P.tealDark);
    }
    g.body(11, 16, 5, 6, body); g.ellipse(11, 17, 3, 4, P.cream);
    g.rect(6, 20, 4, 2, P.ink); g.rect(13, 20, 4, 2, P.ink);
    g.rect(6, 20, 3, 1, body); g.rect(14, 20, 2, 1, body);
    g.body(11, 9, 5, 5, body); g.rect(7, 11, 9, 2, body);
    if (id > 4) {
      g.polygon([[7, 7], [7, 2], [10, 6]], P.ink); g.rect(8, 4, 1, 3, body);
      if (id === 6) { g.polygon([[13, 6], [15, 2], [15, 8]], P.ink); g.rect(14, 4, 1, 3, body); }
    }
    g.eye(8, 8); g.eye(13, 8); g.rect(10, 12, 3, 1, P.bark);
    g.rect(5, 15, 3, 2, body); g.rect(14, 15, 3, 2, body);
  } else if (id >= 7 && id <= 9) {
    g.body(13, 15, 7, 6, P.wood);
    g.ellipse(14, 14, 4, 4, P.bark); g.rect(13, 11, 1, 7, P.gold); g.rect(10, 14, 7, 1, P.gold);
    if (id === 9) {
      for (const x of [4, 17]) {
        g.rect(x, 7, 4, 8, P.ink); g.rect(x + 1, 8, 2, 5, P.stone); g.rect(x + 1, 7, 2, 2, P.grey);
      }
    } else {
      g.body(20, 17, 3, 3, id === 8 ? P.white : P.blue);
      g.rect(20, 16, 2, 1, P.tealDark);
    }
    g.body(10, 17, 5, 5, P.cream);
    g.rect(6, 20, 3, 2, P.ink); g.rect(13, 20, 3, 2, P.ink);
    g.rect(6, 20, 2, 1, P.blue); g.rect(13, 20, 2, 1, P.blue);
    g.body(10, 9, 5, 5, P.blue);
    if (id === 8) {
      g.polygon([[5, 9], [2, 3], [7, 6]], P.ink); g.polygon([[6, 8], [3, 4], [7, 7]], P.white);
      g.polygon([[13, 7], [17, 3], [16, 10]], P.ink); g.polygon([[14, 8], [16, 5], [15, 9]], P.white);
    }
    g.eye(7, 8); g.eye(12, 8); g.rect(9, 12, 3, 1, P.tealDark);
    g.rect(3, 15, 4, 3, P.blue); g.rect(14, 15, 3, 3, P.blue);
    g.rect(8, 16, 5, 1, P.gold); g.rect(9, 19, 3, 1, P.gold);
  } else if (id === 10 || id === 13) {
    const body = id === 10 ? '#82a956' : '#c7a064';
    for (const [x, y, r] of [[18, 18, 3], [15, 17, 3], [12, 15, 4], [8, 12, 5]]) {
      g.body(x, y, r, r, body);
      g.ellipse(x - 1, y - 1, 1, 1, id === 10 ? P.lime : P.cream);
    }
    g.eye(6, 10); g.eye(10, 10);
    g.ellipse(8, 15, 2, 1, id === 10 ? P.cream : P.pink);
    if (id === 10) {
      g.rect(7, 5, 2, 4, P.red); g.rect(5, 4, 3, 2, P.red); g.rect(9, 4, 3, 2, P.red);
    } else {
      g.polygon([[6, 8], [8, 2], [10, 8]], P.ink); g.polygon([[7, 7], [8, 4], [9, 7]], P.cream);
      g.polygon([[18, 17], [22, 13], [21, 20]], P.cream);
    }
    for (const x of [7, 12, 16]) g.rect(x, 19, 2, 2, P.orange);
  } else if (id === 11) {
    g.polygon([[13, 2], [18, 7], [17, 17], [12, 22], [6, 17], [7, 10]], P.ink);
    g.polygon([[13, 4], [17, 8], [16, 17], [12, 20], [7, 16], [8, 10]], P.light);
    g.polygon([[13, 4], [13, 12], [8, 15], [9, 10]], P.lime);
    g.polygon([[8, 15], [13, 14], [16, 17], [12, 19]], P.leaf);
    g.rect(12, 9, 4, 1, P.ink); g.rect(14, 10, 1, 2, P.ink);
  } else if (id === 12) {
    for (const side of [-1, 1]) {
      const x = 12 + side * 6;
      g.body(x, 9, 6, 7, P.purple); g.ellipse(x, 8, 4, 5, P.white);
      g.body(x, 17, 4, 4, P.purple); g.ellipse(x, 17, 2, 2, P.cream);
      g.rect(x - 1, 6, 1, 6, '#c8c9bb'); g.rect(x - 2, 11, 4, 1, '#c8c9bb');
    }
    g.body(12, 14, 3, 7, P.purple);
    g.body(12, 9, 4, 4, P.tealDark);
    g.rect(9, 8, 2, 3, P.red); g.rect(13, 8, 2, 3, P.red);
    g.rect(9, 8, 1, 1, P.white); g.rect(13, 8, 1, 1, P.white);
    g.rect(9, 3, 1, 4, P.ink); g.rect(14, 3, 1, 4, P.ink);
  } else if (id === 16) {
    g.polygon([[15, 16], [22, 13], [21, 18], [16, 21]], P.ink);
    g.polygon([[16, 17], [21, 15], [20, 18], [16, 20]], P.wood);
    g.body(11, 15, 7, 6, P.wood); g.ellipse(10, 16, 4, 4, P.cream);
    g.body(10, 9, 5, 5, P.wood); g.ellipse(10, 10, 4, 3, P.cream);
    g.polygon([[5, 8], [8, 3], [11, 5], [14, 4], [14, 9]], P.bark);
    g.eye(7, 8); g.eye(12, 8); g.rect(9, 11, 3, 2, P.pink);
    g.polygon([[14, 13], [19, 14], [16, 19], [13, 18]], P.bark);
    g.rect(7, 20, 2, 2, P.pink); g.rect(13, 20, 2, 2, P.pink);
  } else if (id === 19 || id === 20) {
    const body = id === 19 ? P.purple : P.orange;
    g.rect(18, 17, 4, 2, body); g.rect(21, 11, 2, 7, body); g.rect(18, 10, 4, 2, body);
    g.body(12, 16, id === 20 ? 8 : 6, 5, body);
    g.body(9, 12, 6, 5, body);
    g.body(5, 7, 3, 4, body); g.ellipse(5, 7, 1, 2, P.pink);
    g.body(13, 7, 3, 4, body); g.ellipse(13, 7, 1, 2, P.pink);
    g.ellipse(9, 15, 4, 3, P.cream);
    g.eye(6, 11); g.eye(11, 11); g.rect(8, 14, 2, 1, P.pink);
    g.rect(8, 16, 2, id === 20 ? 3 : 2, P.white);
    g.rect(4, 19, 4, 2, body); g.rect(14, 19, 4, 2, body);
    if (id === 20) { g.rect(2, 13, 3, 1, P.cream); g.rect(13, 14, 4, 1, P.cream); }
  } else if (id === 25 || id === 26) {
    const body = id === 25 ? P.gold : P.orange;
    g.polygon([[17, 17], [21, 17], [20, 13], [24, 10], [22, 7], [18, 11], [19, 14], [16, 16]], P.ink);
    g.polygon([[18, 16], [20, 16], [19, 12], [23, 10], [22, 8], [19, 11], [20, 14]], P.gold);
    g.body(11, 16, 6, 6, body); g.ellipse(11, 17, 3, 4, id === 26 ? P.cream : '#eac977');
    g.polygon([[6, 9], [3, 1], [6, 2], [10, 9]], P.ink);
    g.polygon([[13, 8], [16, 1], [19, 1], [17, 10]], P.ink);
    g.polygon([[6, 8], [5, 4], [6, 4], [9, 9]], body);
    g.polygon([[14, 9], [17, 4], [18, 4], [16, 10]], body);
    g.body(11, 11, 7, 5, body); g.eye(7, 9); g.eye(13, 9);
    g.rect(5, 13, 2, 2, id === 25 ? P.red : P.gold); g.rect(15, 13, 2, 2, id === 25 ? P.red : P.gold);
    g.rect(10, 13, 2, 1, P.ink); g.rect(10, 15, 2, 1, P.bark);
    g.rect(5, 20, 4, 2, P.ink); g.rect(13, 20, 4, 2, P.ink);
    g.rect(5, 20, 3, 1, body); g.rect(14, 20, 2, 1, body);
  } else {
    g.body(12, 13, 7, 8, P.teal); g.eye(8, 10); g.eye(14, 10); g.rect(10, 16, 4, 1, P.deep);
  }
}

function environment(g: PixelPainter, kind: string) {
  if (kind === 'tree') {
    g.shadow(24, 52, 17);
    g.polygon([[20, 35], [29, 35], [29, 47], [34, 52], [25, 51], [17, 53], [20, 46]], P.ink);
    g.rect(22, 34, 5, 16, P.wood); g.rect(22, 39, 2, 10, '#b1814c'); g.rect(27, 34, 2, 14, P.bark);
    g.polygon([[22, 47], [18, 51], [23, 50]], P.wood);
    for (const [x, y, rx, ry] of [[14, 25, 12, 12], [32, 25, 13, 12], [24, 15, 16, 14], [23, 32, 17, 10]]) g.ellipse(x, y, rx, ry, P.ink);
    for (const [x, y, rx, ry] of [[14, 24, 11, 11], [32, 24, 12, 11], [24, 14, 15, 13], [23, 31, 16, 9]]) g.ellipse(x, y, rx, ry, P.forest);
    g.ellipse(21, 13, 12, 10, P.leaf); g.ellipse(11, 23, 7, 7, P.leaf); g.ellipse(32, 22, 8, 8, P.leaf);
    g.ellipse(21, 10, 9, 6, P.light); g.ellipse(10, 21, 5, 4, P.light); g.ellipse(31, 20, 5, 4, P.light);
    for (const [x, y, w] of [[16, 7, 5], [24, 9, 4], [12, 14, 3], [29, 17, 4], [7, 21, 3], [19, 26, 4], [27, 30, 3], [35, 25, 3]]) g.rect(x, y, w, 1, '#9cab5e');
    for (const [x, y] of [[7, 29], [14, 32], [21, 35], [28, 32], [35, 30], [37, 18]]) g.rect(x, y, 3, 2, P.deep);
  } else if (kind === 'bush') {
    g.shadow(12, 21, 10);
    g.body(7, 15, 6, 6, P.leaf); g.body(16, 14, 7, 7, P.leaf); g.ellipse(11, 14, 6, 5, P.leaf);
    g.ellipse(6, 12, 3, 2, P.light); g.ellipse(16, 10, 4, 2, P.light);
    g.rect(7, 16, 2, 2, P.red); g.rect(16, 13, 2, 2, P.red); g.rect(12, 18, 2, 2, P.pink);
  } else if (kind === 'grass') {
    g.polygon([[3, 20], [2, 12], [7, 17], [7, 8], [11, 16], [14, 10], [14, 18], [20, 12], [18, 21]], P.forest);
    g.polygon([[5, 20], [4, 15], [8, 19], [8, 12], [11, 18], [13, 14], [13, 20], [18, 16], [17, 21]], P.light);
  } else if (kind === 'flower') {
    for (const [x, y] of [[6, 13], [15, 9], [18, 17]]) {
      g.rect(x, y, 1, 7, P.forest); g.rect(x + 1, y + 4, 2, 1, P.leaf);
      g.rect(x - 1, y - 2, 3, 5, P.white); g.rect(x - 2, y - 1, 5, 3, P.cream); g.rect(x, y, 1, 1, P.gold);
    }
  } else if (kind === 'rock') {
    g.shadow(12, 20, 9);
    g.polygon([[3, 19], [4, 11], [9, 6], [17, 7], [21, 14], [20, 20], [7, 22]], P.ink);
    g.polygon([[4, 18], [5, 12], [10, 7], [17, 8], [20, 14], [19, 19], [7, 21]], P.grey);
    g.polygon([[5, 12], [10, 7], [17, 8], [18, 12], [12, 16], [6, 16]], P.stone);
    g.polygon([[7, 11], [10, 8], [15, 9], [12, 11]], '#bcc2a5');
    g.rect(6, 19, 6, 2, P.leaf); g.rect(4, 17, 2, 2, P.light);
  } else if (kind === 'crate') {
    g.shadow(12, 21, 9); g.rect(3, 5, 18, 17, P.ink); g.rect(4, 6, 16, 15, P.bark);
    g.rect(5, 7, 14, 12, P.wood); g.rect(6, 8, 12, 1, '#ba9159');
    for (const x of [8, 12, 16]) g.rect(x, 8, 1, 10, P.bark);
    g.rect(4, 6, 16, 2, '#c59e62'); g.rect(4, 18, 16, 2, '#b38a54');
    g.polygon([[5, 8], [7, 8], [19, 17], [19, 19], [17, 19], [5, 10]], P.gold);
    for (const [x, y] of [[5, 7], [18, 7], [5, 19], [18, 19]]) g.rect(x, y, 1, 1, P.ink);
    g.rect(10, 10, 5, 5, P.deep); g.rect(12, 11, 1, 3, P.cream); g.rect(11, 12, 3, 1, P.cream);
  } else if (kind === 'camp') {
    g.shadow(24, 34, 22);
    g.rect(4, 33, 40, 3, P.bark);
    g.polygon([[2, 32], [15, 6], [31, 6], [45, 32]], P.ink);
    g.polygon([[4, 31], [16, 7], [31, 7], [43, 31]], P.cream);
    g.polygon([[15, 8], [26, 31], [42, 31], [30, 8]], P.gold);
    g.polygon([[15, 9], [6, 31], [25, 31]], P.forest);
    g.polygon([[15, 13], [10, 30], [22, 30]], P.deep);
    g.rect(14, 6, 2, 28, P.wood); g.rect(30, 7, 2, 25, '#d2aa62');
    g.rect(34, 12, 5, 3, P.red); g.rect(35, 11, 3, 5, P.red);
    g.rect(5, 25, 2, 9, P.wood); g.rect(42, 25, 2, 9, P.wood);
    g.ellipse(7, 21, 2, 3, P.gold); g.rect(6, 20, 2, 2, P.white);
    g.rect(34, 32, 9, 4, P.bark); g.rect(35, 32, 7, 2, P.wood);
  } else if (kind === 'shrine') {
    g.shadow(16, 35, 13);
    g.rect(3, 31, 26, 5, P.ink); g.rect(4, 31, 24, 3, P.grey); g.rect(6, 30, 20, 2, P.stone);
    g.polygon([[8, 30], [8, 12], [16, 4], [24, 12], [24, 30]], P.ink);
    g.polygon([[10, 29], [10, 13], [16, 7], [22, 13], [22, 29]], P.grey);
    g.polygon([[11, 13], [16, 8], [21, 13], [20, 15], [12, 15]], P.stone);
    g.rect(12, 17, 8, 9, P.deep);
    g.polygon([[16, 16], [19, 20], [16, 26], [13, 21]], P.teal);
    g.rect(16, 19, 1, 5, P.lime); g.rect(12, 27, 9, 1, P.gold);
    g.rect(8, 26, 3, 4, P.leaf); g.rect(23, 21, 2, 8, P.leaf); g.rect(21, 25, 3, 2, P.light);
  } else if (kind === 'ball') {
    g.shadow(12, 20, 6); g.body(12, 12, 8, 8, P.white);
    g.ellipse(12, 11, 7, 7, P.red); g.rect(5, 12, 14, 1, P.ink);
    for (let y = 13; y < 19; y++) {
      const d = (y + 0.5 - 12) / 7; const s = Math.sqrt(Math.max(0, 1 - d * d)) * 7;
      g.rect(Math.ceil(12 - s - 0.5), y, Math.floor(12 + s - 0.5) - Math.ceil(12 - s - 0.5) + 1, 1, P.cream);
    }
    g.body(12, 12, 3, 3, P.white); g.rect(8, 7, 3, 1, P.pink);
  } else if (kind === 'gem') {
    g.polygon([[12, 3], [19, 11], [12, 21], [5, 11]], P.deep);
    g.polygon([[12, 5], [17, 11], [12, 18], [7, 11]], P.teal);
    g.polygon([[12, 5], [12, 11], [7, 11]], P.cyan); g.polygon([[12, 11], [17, 11], [12, 18]], P.tealDark);
    g.rect(10, 8, 2, 2, P.white);
  } else if (kind === 'leaf') {
    g.polygon([[3, 19], [5, 8], [12, 4], [21, 3], [20, 12], [15, 18], [6, 20]], P.deep);
    g.polygon([[5, 17], [7, 9], [12, 6], [19, 5], [18, 12], [14, 16], [7, 18]], P.light);
    g.polygon([[3, 21], [17, 7], [16, 10], [5, 22]], P.lime);
  } else if (kind === 'lightning') {
    g.polygon([[12, 1], [20, 1], [15, 10], [21, 10], [7, 23], [11, 13], [4, 13]], P.wood);
    g.polygon([[13, 2], [18, 2], [13, 11], [18, 11], [9, 20], [13, 12], [6, 12]], P.gold);
    g.rect(13, 4, 2, 4, P.cream);
  }
}

/**
 * Normal actors and pickups are 48×48. Tree: 96×112, camp: 96×80,
 * shrine: 64×80. All are transparent, nearest-neighbour, original prototype art.
 * Unknown species receive a readable generic teal silhouette.
 */
export function makeSprite(kind: string): HTMLCanvasElement {
  const width = kind === 'tree' || kind === 'camp' ? 48 : kind === 'shrine' ? 32 : 24;
  const height = kind === 'tree' ? 56 : kind === 'camp' || kind === 'shrine' ? 40 : 24;
  const low = surface(width, height);
  const context = low.getContext('2d');
  if (!context) throw new Error('Canvas 2D is required for the local game.');
  const g = new PixelPainter(context);
  if (kind.startsWith('species-')) creature(g, Number(kind.slice(8)));
  else if (kind === 'trainer') {
    g.shadow(12, 22, 6);
    g.rect(7, 11, 11, 8, P.ink); g.rect(14, 12, 4, 6, P.wood); g.rect(15, 13, 2, 3, P.gold);
    g.rect(8, 12, 7, 6, P.blue); g.rect(8, 12, 2, 5, P.cream); g.rect(13, 13, 1, 4, P.cream);
    g.rect(6, 13, 2, 4, P.cream); g.rect(15, 13, 2, 4, P.cream);
    g.rect(8, 18, 3, 4, P.ink); g.rect(12, 18, 3, 4, P.ink);
    g.rect(8, 18, 3, 2, '#53626c'); g.rect(12, 18, 3, 2, '#53626c');
    g.rect(7, 21, 4, 2, P.bark); g.rect(12, 21, 4, 2, P.bark);
    g.body(11, 8, 5, 5, P.cream); g.rect(7, 7, 1, 3, P.bark); g.rect(14, 7, 1, 3, P.bark);
    g.rect(9, 8, 1, 2, P.ink); g.rect(13, 8, 1, 2, P.ink); g.rect(10, 11, 3, 1, '#c19670');
    g.rect(6, 4, 10, 3, P.ink); g.rect(7, 3, 8, 2, P.ink); g.rect(7, 4, 8, 2, P.red);
    g.rect(9, 3, 5, 2, P.red); g.rect(8, 6, 10, 2, P.red); g.rect(10, 4, 3, 2, P.white);
  } else environment(g, kind);
  const result = surface(width * 2, height * 2);
  const resultContext = result.getContext('2d');
  if (!resultContext) throw new Error('Canvas 2D is required for the local game.');
  resultContext.imageSmoothingEnabled = false;
  resultContext.drawImage(low, 0, 0, result.width, result.height);
  return result;
}

/** Repeating grass texture; all marks wrap across edges so no seam is introduced. */
export function makeGround(seed: number, width = 512, height = 512): HTMLCanvasElement {
  const canvas = surface(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)));
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Canvas 2D is required for the local game.');
  c.fillStyle = '#738052'; c.fillRect(0, 0, canvas.width, canvas.height);
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const wrapRect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    for (const dx of [-canvas.width, 0, canvas.width]) for (const dy of [-canvas.height, 0, canvas.height]) {
      c.fillRect(x + dx, y + dy, w, h);
    }
  };
  const area = canvas.width * canvas.height;
  for (let i = 0; i < area / 480; i++) {
    const x = Math.floor(random() * canvas.width / 2) * 2;
    const y = Math.floor(random() * canvas.height / 2) * 2;
    const w = 6 + Math.floor(random() * 11) * 2;
    const h = 2 + Math.floor(random() * 3) * 2;
    wrapRect(x, y, w, h, random() > 0.5 ? '#778655' : '#6e7c50');
    if (random() > 0.6) wrapRect(x + 2, y + h, w - 4, 2, '#6b794e');
  }
  for (let i = 0; i < area / 1150; i++) {
    const x = Math.floor(random() * canvas.width / 2) * 2;
    const y = Math.floor(random() * canvas.height / 2) * 2;
    wrapRect(x, y, 2, 4, '#64784d'); wrapRect(x + 2, y + 2, 4, 2, '#64784d');
    wrapRect(x + 2, y - 2, 2, 4, '#8b985e');
    if (random() > 0.7) wrapRect(x + 6, y + 4, 2, 2, '#b1ad71');
  }
  return canvas;
}
