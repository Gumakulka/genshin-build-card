import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
function test(name, run) { run(); passed++; console.log('OK ' + name); }
const document = { activeElement: null };
class Node {
  constructor(tag, className = '', text = '') {
    this.tagName = tag;
    this.className = className;
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attributes = {};
    this.events = {};
    this.hidden = false;
    this._text = text;
    this.style = { setProperty() {} };
    this.classList = {
      contains: (name) => this.className.split(' ').includes(name),
      add: (name) => { if (!this.classList.contains(name)) this.className = (this.className + ' ' + name).trim(); },
      remove: (name) => { this.className = this.className.split(' ').filter((item) => item !== name).join(' '); },
      toggle: (name, force) => force ? this.classList.add(name) : this.classList.remove(name)
    };
  }
  get textContent() { return this._text + this.children.map((child) => child.textContent).join(''); }
  set textContent(value) { this._text = value; this.children.forEach((child) => { child.parentNode = null; }); this.children = []; }
  append(...nodes) { nodes.forEach((node) => { node.remove(); node.parentNode = this; this.children.push(node); }); }
  prepend(node) { node.remove(); node.parentNode = this; this.children.unshift(node); }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((node) => node !== this); this.parentNode = null; }
  before(node) { const parent = this.parentNode; node.remove(); const index = parent.children.indexOf(this); node.parentNode = parent; parent.children.splice(index, 0, node); }
  after(node) { const parent = this.parentNode; node.remove(); const index = parent.children.indexOf(this); node.parentNode = parent; parent.children.splice(index + 1, 0, node); }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, fn) { (this.events[key] ||= []).push(fn); }
  fire(key, extra = {}) { const event = { key: '', prevented: false, preventDefault() { this.prevented = true; }, ...extra }; (this.events[key] || []).forEach((fn) => fn(event)); return event; }
  focus() { document.activeElement = this; }
  querySelector(selector) {
    for (const child of this.children) {
      if (selector.startsWith('.') && child.classList.contains(selector.slice(1))) return child;
      if (selector.startsWith('#') && child.id === selector.slice(1)) return child;
      const descendant = child.querySelector(selector);
      if (descendant) return descendant;
    }
    return null;
  }
}
const state = { lang: 'pl', last: null, detailBox: new Node('div') };
const saved = {};
let includeArtifacts = true;
function baseRender() {
  state.detailBox.textContent = '';
  const panel = new Node('div', 'detail');
  panel.append(new Node('div', 'detail-head'), new Node('section', 'sc'), new Node('section', 'codex'), new Node('p', 'hint', 'Visible warning'), new Node('div', 'detail-grid'), new Node('details', 'guide'));
  if (includeArtifacts) {
    const wrapper = new Node('div', 'panel');
    wrapper.append(new Node('div', 'artifacts'));
    panel.append(new Node('div', 'hint'), wrapper);
  }
  state.detailBox.append(panel);
}
const ctx = vm.createContext({ document, state, renderDetail: baseRender, el: (tag, cls, text) => new Node(tag, cls, text), loadSetting: (key, fallback) => saved[key] || fallback, saveSetting: (key, value) => { saved[key] = value; } });
vm.runInContext(readFileSync(resolve(root, 'src/js/ui/detail-tabs.js'), 'utf8'), ctx);
const run = (source) => vm.runInContext(source, ctx);
const panel = (id) => state.detailBox.querySelector('#detail-panel-' + id);
const button = (id) => state.detailBox.querySelector('#detail-tab-' + id);
run('renderDetail()');
test('default card visible', () => assert.equal(panel('card').hidden, false));
test('analysis starts hidden', () => assert.equal(panel('analysis').hidden, true));
test('warning does not move analysis to artifacts', () => assert.ok(panel('analysis').querySelector('.detail-grid')));
test('artifacts have own panel', () => assert.ok(panel('artifacts').querySelector('.artifacts')));
test('all four buttons exist', () => assert.equal(state.detailBox.querySelector('.detail-tabs').children.length, 4));
test('tab controls panel id', () => assert.equal(button('talents').attributes['aria-controls'], panel('talents').id));
test('panel labelled by tab', () => assert.equal(panel('talents').attributes['aria-labelledby'], button('talents').id));
button('analysis').fire('click');
test('click selects analysis', () => assert.equal(panel('analysis').hidden, false));
test('card hidden after selection', () => assert.equal(panel('card').hidden, true));
test('selected tab saved', () => assert.equal(saved.detailTab, 'analysis'));
test('roving tabIndex', () => { assert.equal(button('analysis').tabIndex, 0); assert.equal(button('card').tabIndex, -1); });
const right = button('analysis').fire('keydown', { key: 'ArrowRight' });
test('right arrow selects next', () => assert.equal(panel('artifacts').hidden, false));
test('arrow prevents default', () => assert.equal(right.prevented, true));
test('arrow moves focus', () => assert.equal(document.activeElement, button('artifacts')));
button('artifacts').fire('keydown', { key: 'Home' });
test('Home selects card', () => assert.equal(panel('card').hidden, false));
button('card').fire('keydown', { key: 'ArrowLeft' });
test('left arrow wraps', () => assert.equal(panel('artifacts').hidden, false));
run('renderDetail()');
test('selection survives rerender', () => assert.equal(panel('artifacts').hidden, false));
test('no duplicate tab bar after rerender', () => assert.equal(state.detailBox.children[0].children.filter((node) => node.classList.contains('detail-tabs')).length, 1));
includeArtifacts = false;
run('renderDetail()');
test('missing artifacts falls back to card', () => assert.equal(panel('card').hidden, false));
test('missing artifacts tab omitted', () => assert.equal(button('artifacts'), null));
state.lang = 'en';
run('renderDetail()');
test('English labels on rerender', () => assert.equal(button('talents').textContent, 'Talents and materials'));

const heroIcons = new Node('div');
const hero = { hidden: false };
let mobile = false;
let chosen = { icon: 'UI_AvatarIcon_Furina_Circle', element: 'Water' };
const nav = { connection: {} };
const heroContext = vm.createContext({ IMG_URL: 'https://enka.network/ui/', navigator: nav, window: { matchMedia: () => ({ matches: mobile }) }, hero, heroIcons, heroCurrent: () => chosen, setHeroBanner() {}, showcaseSetElement() {}, el: (tag, cls) => new Node(tag, cls), codexImage: (urls, alt, cls) => { const image = new Node('img', cls); image.urls = urls; return image; } });
vm.runInContext(readFileSync(resolve(root, 'src/js/features/hero-art.js'), 'utf8'), heroContext);
const heroRun = (source) => vm.runInContext(source, heroContext);
test('Circle suffix stripped', () => assert.equal(heroRun("heroArtName('UI_AvatarIcon_Furina_Circle')"), 'Furina'));
test('Side icon accepted', () => assert.equal(heroRun("heroArtName('UI_AvatarIcon_Side_Navia')"), 'Navia'));
test('unsafe name rejected', () => assert.equal(heroRun("heroArtName('../../x')"), null));
test('hero URL excludes Circle', () => assert.ok(heroIcons.querySelector('.hero-art-img').urls[0].endsWith('_Furina.png')));
heroIcons.querySelector('.hero-art-img').fire('load');
test('image load marks banner ready', () => assert.equal(heroIcons.querySelector('.hero-art').classList.contains('ready'), true));
const failed = heroIcons.querySelector('.hero-art-img');
failed.classList.add('missing');
failed.fire('error');
test('final image error removes empty banner', () => assert.equal(heroIcons.classList.contains('has-art'), false));
heroRun('setHeroBanner()');
heroRun('setHeroBanner()');
test('only one hero art layer', () => assert.equal(heroIcons.children.length, 1));
mobile = true;
heroRun('setHeroBanner()');
test('no large art on mobile', () => assert.equal(heroIcons.children.length, 0));
mobile = false;
nav.connection.saveData = true;
heroRun('setHeroBanner()');
test('no large art with data saver', () => assert.equal(heroIcons.children.length, 0));
nav.connection.saveData = false;
hero.hidden = true;
heroRun('setHeroBanner()');
test('hidden start screen does not load art', () => assert.equal(heroIcons.children.length, 0));
console.log('Passed ' + passed + ' UI logic tests. DOM is simulated; browser layout is not tested.');
