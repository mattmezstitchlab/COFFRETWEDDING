/* World Wedding Magazine — additive compatibility bridge.
   The archived input is byte-for-byte unchanged. Existing editor methods are
   retained and wrapped; the parent magazine remains the canonical source. */
(function () {
  'use strict';
  var embedded = new URLSearchParams(location.search).has('embedded');
  var magazine = null;
  var activeHour = 8;
  var activeScene = 0;
  var activeMonth = 3;
  var receiving = false;
  var originals = {
    init: WMM.init, switchView: WMM.switchView, renderEditorTree: WMM.renderEditorTree,
    loadSceneInEditor: WMM.loadSceneInEditor, updateField: WMM.updateField,
    updateBlock: WMM.updateBlock, updateEditorPreview: WMM.updateEditorPreview,
    expandWedding: WMM.expandWedding, on3DClick: WMM.on3DClick,
    renderTimeline: WMM.renderTimeline, renderMagazine: WMM.renderMagazine
  };
  function send(type, payload) {
    if (embedded) parent.postMessage(Object.assign({ type: type }, payload || {}), location.origin);
  }
  function escapeText(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function displayCopy(value) {
    if (typeof value === 'string') return escapeText(value);
    if (Array.isArray(value)) return value.map(displayCopy);
    if (value && typeof value === 'object') {
      var next = {}; Object.keys(value).forEach(function (key) { next[key] = displayCopy(value[key]); }); return next;
    }
    return value;
  }
  function withSafeEntities(callback) {
    var savedPlaces = {}, savedProfessionals = {};
    Object.keys(places).forEach(function (key) { savedPlaces[key] = places[key]; places[key] = displayCopy(places[key]); });
    Object.keys(professionals).forEach(function (key) { savedProfessionals[key] = professionals[key]; professionals[key] = displayCopy(professionals[key]); });
    try { return callback(); } finally {
      Object.keys(savedPlaces).forEach(function (key) { places[key] = savedPlaces[key]; });
      Object.keys(savedProfessionals).forEach(function (key) { professionals[key] = savedProfessionals[key]; });
    }
  }
  var style = document.createElement('style');
  style.textContent = 'body{background:#faf9f6} .wmm-loading{display:none!important} .bridge-status{margin-left:auto;font-size:10px;color:#6b9080;display:flex;align-items:center;gap:6px}.bridge-status:before{content:"";width:5px;height:5px;background:#6b9080;border-radius:50%}.bridge-month{width:100%;padding:9px;background:#27272f;color:#e5dac4;border:1px solid #454044;border-radius:3px;font:12px Georgia;margin-bottom:15px}.editor-toolbar-btn{min-height:29px}.editor-field input,.editor-field textarea{line-height:1.6}.editor-tree-item{line-height:1.5}.editor-preview{width:265px}.editor-sidebar{width:255px}.bridge-back{position:fixed;top:12px;right:16px;background:#f5f0e7;border:1px solid #c9a96e;color:#1a1a2e;font:12px Georgia;padding:10px 15px;z-index:1100;cursor:pointer;border-radius:3px;display:none}.bridge-toast{position:fixed;bottom:35px;left:50%;transform:translateX(-50%);padding:13px 22px;border-radius:4px;background:#26392d;color:#fff;font:12px Georgia;z-index:5000}.editor-canvas{padding:30px}.editor-field textarea:focus{box-shadow:0 0 0 2px #c9a96e20}.editor-field input:focus{box-shadow:0 0 0 2px #c9a96e20} @media(max-width:1000px){.editor-preview{display:none}.editor-sidebar{width:215px}}@media(max-width:600px){.editor-sidebar{width:145px;padding:12px}.editor-canvas{padding:18px 12px}.editor-toolbar{gap:4px;padding:0 8px}.editor-toolbar-btn{padding:5px 7px;font-size:10px}.bridge-status{display:none}.editor-tree-item{font-size:10px}.editor-tree-item.level-1{padding-left:4px}.editor-tree-item.level-2{padding-left:10px}}';
  if (embedded) style.textContent += '.wmm-header{display:none!important}.wmm-main{top:0}';
  document.head.appendChild(style);
  var back = document.createElement('button'); back.className = 'bridge-back'; back.textContent = '← Revenir à l’éditeur'; back.onclick = function () { WMM.switchView('editor'); }; document.body.appendChild(back);
  function toast(text) {
    var old = document.querySelector('.bridge-toast'); if (old) old.remove();
    var element = document.createElement('div'); element.className = 'bridge-toast'; element.textContent = text; element.setAttribute('role', 'status'); document.body.appendChild(element); setTimeout(function () { element.remove(); }, 4000);
  }
  function currentScene() {
    var w = WMM.currentWedding; return w && w.hours[activeHour] && w.hours[activeHour].scenes[activeScene];
  }
  WMM.init = function () {
    this.initNavigation();
    this.currentWedding = weddings[3] || weddings[0];
    this.initEditor();
    this.initMonthNav();
    originals.switchView.call(this, 'editor');
    document.getElementById('loading').classList.add('hidden');
    var status = document.createElement('span'); status.className = 'bridge-status'; status.id = 'bridge-save-status'; status.textContent = 'Source commune'; document.querySelector('.editor-toolbar').appendChild(status);
    send('wmm:ready');
    if (!embedded) {
      try {
        var request = indexedDB.open('world-wedding-magazine-france', 1);
        request.onsuccess = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains('source-commune')) return;
          var get = db.transaction('source-commune', 'readonly').objectStore('source-commune').get('magazine');
          get.onsuccess = function () { if (get.result) applyMagazine(get.result, 'wedding_apr', 8); };
        };
      } catch (e) { toast('Ouvrez le magazine pour retrouver votre source commune.'); }
    }
  };
  WMM.renderEditorTree = function () {
    var raw = weddings.slice();
    try {
      weddings.splice.apply(weddings, [0, weddings.length].concat(raw.map(displayCopy)));
      originals.renderEditorTree.call(this);
    } finally { weddings.splice.apply(weddings, [0, weddings.length].concat(raw)); }
    var tree = document.getElementById('editor-tree');
    var breadcrumb = tree.querySelector('div'); if (breadcrumb) breadcrumb.textContent = 'World → France → 2026';
    var month = document.createElement('select'); month.className = 'bridge-month'; month.setAttribute('aria-label', 'Mois dans l’arbre éditorial');
    month.innerHTML = MONTHS.map(function (name, i) { return '<option value="' + i + '">' + name + ' · ' + weddings.filter(function (w) { return w.month === i; }).length + ' coffrets</option>'; }).join('');
    month.value = activeMonth;
    month.onchange = function () { activeMonth = Number(month.value); WMM.renderEditorTree(); };
    tree.insertBefore(month, tree.firstChild);
    var headings = tree.querySelectorAll('.editor-tree-item.level-1');
    headings.forEach(function (heading, index) {
      var w = weddings[index];
      heading.style.display = w.month === activeMonth ? '' : 'none';
      var detail = document.getElementById('tree-wedding-' + index);
      if (WMM.currentWedding && WMM.currentWedding.id === w.id && w.month === activeMonth) { detail.style.display = 'block'; heading.classList.add('selected'); }
      else detail.style.display = 'none';
    });
  };
  WMM.expandWedding = function (index, el) {
    originals.expandWedding.call(this, index, el);
    this.currentWedding = weddings[index];
  };
  WMM.loadSceneInEditor = function (wedding, hour, sceneIndex) {
    var raw = weddings.find(function (w) { return w.id === wedding.id; }) || wedding;
    if (!raw.hours[hour] || !raw.hours[hour].scenes[sceneIndex]) return;
    this.currentWedding = raw; activeHour = hour; activeScene = sceneIndex;
    var scene = raw.hours[hour].scenes[sceneIndex];
    var self = this;
    withSafeEntities(function () { originals.loadSceneInEditor.call(self, displayCopy(raw), hour, sceneIndex); });
    var canvas = document.getElementById('editor-canvas');
    canvas.querySelectorAll('[onchange]').forEach(function (el) { el.removeAttribute('onchange'); });
    var fields = canvas.querySelectorAll('.editor-field');
    ['surtitre', 'title', 'chapo'].forEach(function (key, index) {
      var input = fields[index].querySelector('input,textarea');
      input.value = scene[key]; input.setAttribute('aria-label', key === 'title' ? 'Titre de la scène' : key === 'chapo' ? 'Chapô de la scène' : 'Surtitre de la scène');
      input.addEventListener('input', function () { WMM.updateField(raw.id, hour, sceneIndex, key, input.value); });
    });
    fields[3].querySelectorAll('textarea').forEach(function (input, index) {
      input.value = scene.blocks[index].content; input.setAttribute('aria-label', 'Bloc ' + (index + 1) + ' : ' + scene.blocks[index].type);
      input.addEventListener('input', function () { WMM.updateBlock(raw.id, hour, sceneIndex, index, input.value); });
    });
    var readonly = fields[4] && fields[4].querySelector('input'); if (readonly) readonly.value = places[raw.place].name + ' — ' + places[raw.place].city;
    this.updateEditorPreview(scene);
    if (!receiving) send('wmm:selection', { coffretId: raw.id, hour: hour });
  };
  WMM.updateField = function (id, hour, scene, field, value) {
    originals.updateField.call(this, id, hour, scene, field, value);
    var w = weddings.find(function (item) { return item.id === id; });
    if (field === 'title') { w.hours[hour].title = value; var wi = weddings.indexOf(w); var item = document.querySelectorAll('#tree-wedding-' + wi + ' .level-2')[hour]; if (item) item.textContent = w.hours[hour].label + ' ' + value; }
    this.updateEditorPreview(w.hours[hour].scenes[scene]);
    send('wmm:change', { coffretId: id, hour: hour, sceneIndex: scene, field: field, value: value });
    var status = document.getElementById('bridge-save-status'); if (status) status.textContent = 'Synchronisation…';
  };
  WMM.updateBlock = function (id, hour, scene, block, value) {
    originals.updateBlock.call(this, id, hour, scene, block, value);
    var w = weddings.find(function (item) { return item.id === id; }); this.updateEditorPreview(w.hours[hour].scenes[scene]);
    send('wmm:change', { coffretId: id, hour: hour, sceneIndex: scene, blockIndex: block, field: 'block', value: value });
    var status = document.getElementById('bridge-save-status'); if (status) status.textContent = 'Synchronisation…';
  };
  WMM.updateEditorPreview = function (scene) {
    var raw = currentScene() || scene;
    originals.updateEditorPreview.call(this, displayCopy(raw));
    if (magazine && WMM.currentWedding) {
      var media = magazine.media.find(function (m) { return m.id === WMM.currentWedding.coverId; });
      var preview = document.getElementById('editor-preview-content');
      preview.querySelectorAll('div').forEach(function (element) {
        if (element.textContent === '📷 Image' && media) {
          var image = document.createElement('img'); image.src = media.src; image.alt = media.caption; image.style.cssText = 'width:100%;height:105px;object-fit:cover;border-radius:3px'; element.style.height = 'auto'; element.textContent = ''; element.appendChild(image);
        }
      });
    }
  };
  WMM.editorSave = function () {
    if (embedded) send('wmm:save');
    else if (magazine) {
      var request = indexedDB.open('world-wedding-magazine-france', 1);
      request.onsuccess = function () { var transaction = request.result.transaction('source-commune', 'readwrite'); magazine.coffrets = weddings; transaction.objectStore('source-commune').put(magazine, 'magazine'); transaction.oncomplete = function () { toast('Modifications enregistrées dans la source commune.'); }; transaction.onerror = function () { toast('La sauvegarde a échoué. Exportez depuis le magazine.'); }; };
    }
  };
  WMM.editorPreview = function () { this.switchView('magazine'); };
  WMM.switchView = function (view) {
    if (embedded && ['grid', 'map', 'timeline', 'relations', 'magazine'].includes(view)) { send('wmm:navigate', { view: view, coffretId: this.currentWedding && this.currentWedding.id }); return; }
    if (view === '3d') {
      originals.switchView.call(this, view);
      if (!this.renderer) {
        try { this.init3D(); } catch (error) { originals.switchView.call(this, 'editor'); toast('La 3D nécessite WebGL. L’éditeur et tous vos contenus restent disponibles.'); return; }
      }
      this.onResize3D(); back.style.display = 'block';
      var statusBar = document.querySelector('#view-3d .status-bar'); if (statusBar) statusBar.innerHTML = '<span class="status-dot"></span><span>8 760 moments · 365 coffrets</span><span>Source commune · Données démonstratrices</span><span>Glisser pour tourner · Molette pour zoomer · Cliquer pour éditer</span>';
    } else { originals.switchView.call(this, view); back.style.display = 'none'; }
    send('wmm:view', { view: view });
  };
  WMM.buildInstancedGrid = function () {
    var geometry = new THREE.BoxGeometry(.37, .32, .37);
    var material = new THREE.MeshPhongMaterial({ transparent: true, opacity: .9 });
    var entries = [];
    weddings.forEach(function (w) { for (var h = 0; h < 24; h++) entries.push({ wedding: w, hour: h }); });
    var mesh = new THREE.InstancedMesh(geometry, material, entries.length);
    var dummy = new THREE.Object3D();
    entries.forEach(function (entry, index) {
      var w = entry.wedding, angle = w.month / 12 * Math.PI * 2, d = w.day - 1;
      dummy.position.set(Math.cos(angle) * 20 + (d % 7) * .8 - 2.8, .3 + entry.hour * .39, Math.sin(angle) * 20 + Math.floor(d / 7) * .8 - 2);
      dummy.updateMatrix(); mesh.setMatrixAt(index, dummy.matrix);
      var color = new THREE.Color(w.color); color.multiplyScalar(entry.hour > 5 && entry.hour < 23 ? 1 : .45); mesh.setColorAt(index, color);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.userData.entries = entries; this.meshInstances = mesh; this.scene.add(mesh);
    for (var m = 0; m < 12; m++) { var angle = m / 12 * Math.PI * 2; var sphere = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 12), new THREE.MeshPhongMaterial({ color: 0xc9a96e, emissive: 0xc9a96e, emissiveIntensity: .2 })); sphere.position.set(Math.cos(angle) * 26, 1, Math.sin(angle) * 26); sphere.userData = { month: m, type: 'month-label' }; this.scene.add(sphere); }
  };
  WMM.on3DClick = function (event) {
    originals.on3DClick.call(this, event);
    var hit = this.raycaster.intersectObject(this.meshInstances)[0];
    if (hit && hit.instanceId !== undefined) { var entry = this.meshInstances.userData.entries[hit.instanceId]; activeMonth = entry.wedding.month; this.switchView('editor'); this.renderEditorTree(); this.loadSceneInEditor(entry.wedding, entry.hour, 0); }
  };
  function applyMagazine(data, id, hour) {
    magazine = data;
    weddings.splice.apply(weddings, [0, weddings.length].concat(data.coffrets));
    Object.keys(places).forEach(function (key) { delete places[key]; }); Object.assign(places, data.places);
    Object.keys(professionals).forEach(function (key) { delete professionals[key]; }); Object.assign(professionals, data.professionals);
    var w = weddings.find(function (c) { return c.id === id; }) || weddings[0];
    WMM.currentWedding = w; activeMonth = w.month; activeHour = hour == null ? 8 : hour;
    receiving = true;
    WMM.renderEditorTree(); WMM.switchView('editor'); WMM.loadSceneInEditor(w, activeHour, 0);
    receiving = false;
    send('wmm:loaded', { coffrets: weddings.length, moments: weddings.reduce(function (sum, c) { return sum + Object.keys(c.hours).length; }, 0) });
  }
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || event.source !== parent || !event.data) return;
    var message = event.data;
    if (message.type === 'wmm:init') applyMagazine(message.data, message.coffretId, message.hour);
    if (message.type === 'wmm:select' && magazine) {
      var w = weddings.find(function (c) { return c.id === message.coffretId; });
      if (w) { receiving = true; WMM.currentWedding = w; activeMonth = w.month; WMM.renderEditorTree(); WMM.switchView('editor'); WMM.loadSceneInEditor(w, message.hour == null ? 8 : message.hour, 0); receiving = false; }
    }
    if (message.type === 'wmm:saved') { var status = document.getElementById('bridge-save-status'); if (status) status.textContent = message.success ? 'Enregistré sur cet appareil' : 'Sauvegarde indisponible'; if (message.explicit) toast(message.success ? 'Modifications enregistrées dans la source commune.' : 'La sauvegarde a échoué. Exportez vos données depuis le magazine.'); }
    if (message.type === 'wmm:show') WMM.switchView(message.view);
  });
})();
