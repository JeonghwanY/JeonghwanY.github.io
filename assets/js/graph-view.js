(function () {
  var canvas = document.getElementById('wikigraph');
  if (!canvas) return;

  fetch(canvas.dataset.src)
    .then(function (res) { return res.json(); })
    .then(renderGraph)
    .catch(function (err) { console.error('graph load failed', err); });

  function renderGraph(graph) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var width = canvas.clientWidth;
    var height = canvas.clientHeight || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    var nodes = graph.nodes.map(function (n) {
      return { id: n.id, title: n.title, x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0 };
    });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var links = graph.links
      .map(function (l) { return { source: byId[l.source], target: byId[l.target] }; })
      .filter(function (l) { return l.source && l.target; });

    var degree = {};
    links.forEach(function (l) {
      degree[l.source.id] = (degree[l.source.id] || 0) + 1;
      degree[l.target.id] = (degree[l.target.id] || 0) + 1;
    });

    var hovered = null;

    function step() {
      var cx = width / 2, cy = height / 2;
      nodes.forEach(function (n) {
        n.vx += (cx - n.x) * 0.002;
        n.vy += (cy - n.y) * 0.002;
        nodes.forEach(function (other) {
          if (other === n) return;
          var dx = n.x - other.x, dy = n.y - other.y;
          var distSq = dx * dx + dy * dy || 0.01;
          var force = 600 / distSq;
          n.vx += dx * force * 0.01;
          n.vy += dy * force * 0.01;
        });
      });
      links.forEach(function (l) {
        var dx = l.target.x - l.source.x, dy = l.target.y - l.source.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        var pull = (dist - 120) * 0.01;
        var fx = (dx / dist) * pull, fy = (dy / dist) * pull;
        l.source.vx += fx; l.source.vy += fy;
        l.target.vx -= fx; l.target.vy -= fy;
      });
      nodes.forEach(function (n) {
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(width - 20, n.x));
        n.y = Math.max(20, Math.min(height - 20, n.y));
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(150,150,150,0.4)';
      links.forEach(function (l) {
        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.stroke();
      });
      nodes.forEach(function (n) {
        var r = 4 + Math.min(degree[n.id] || 0, 10);
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n === hovered ? '#e05a2b' : '#4a7dc4';
        ctx.fill();
        if (n === hovered || (degree[n.id] || 0) > 2) {
          ctx.fillStyle = 'currentColor';
          ctx.font = '12px sans-serif';
          ctx.fillText(n.title || n.id, n.x + r + 4, n.y + 4);
        }
      });
    }

    function tick() {
      step();
      draw();
      requestAnimationFrame(tick);
    }
    tick();

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      hovered = null;
      var best = 14;
      nodes.forEach(function (n) {
        var d = Math.hypot(n.x - mx, n.y - my);
        if (d < best) { best = d; hovered = n; }
      });
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    });

    canvas.addEventListener('click', function () {
      if (hovered) window.location.href = hovered.id;
    });
  }
})();
