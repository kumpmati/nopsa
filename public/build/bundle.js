
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Spinner.svelte generated by Svelte v3.29.7 */

    const file = "src\\components\\Spinner.svelte";

    function create_fragment(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "⟳";
    			attr_dev(span, "class", "spinner svelte-1tacnfi");
    			toggle_class(span, "visible", /*active*/ ctx[0]);
    			add_location(span, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1) {
    				toggle_class(span, "visible", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", slots, []);
    	let { active } = $$props;
    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ active });

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<Spinner> was created without expected prop 'active'");
    		}
    	}

    	get active() {
    		throw new Error("<Spinner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Spinner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Uploader.svelte generated by Svelte v3.29.7 */
    const file$1 = "src\\components\\Uploader.svelte";

    // (20:1) {#if message}
    function create_if_block_1(ctx) {
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(/*message*/ ctx[2]);
    			attr_dev(h1, "id", "message");
    			attr_dev(h1, "class", "svelte-ku7auo");
    			add_location(h1, file$1, 20, 2, 487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 4) set_data_dev(t, /*message*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:1) {#if message}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {:else}
    function create_else_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "submit");
    			input.value = "Reset";
    			add_location(input, file$1, 33, 3, 773);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*reset*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(33:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (31:2) {#if !files}
    function create_if_block(ctx) {
    	let label;
    	let b;
    	let t1;

    	const block = {
    		c: function create() {
    			label = element("label");
    			b = element("b");
    			b.textContent = "Open";
    			t1 = text(" transcript");
    			add_location(b, file$1, 31, 27, 726);
    			attr_dev(label, "for", "file-input");
    			attr_dev(label, "class", "svelte-ku7auo");
    			add_location(label, file$1, 31, 3, 702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, b);
    			append_dev(label, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(31:2) {#if !files}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let t0;
    	let div;
    	let input;
    	let t1;
    	let t2;
    	let span;
    	let spinner;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*message*/ ctx[2] && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*files*/ ctx[3]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	spinner = new Spinner({
    			props: { active: /*loading*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			input = element("input");
    			t1 = space();
    			if_block1.c();
    			t2 = space();
    			span = element("span");
    			create_component(spinner.$$.fragment);
    			attr_dev(input, "id", "file-input");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".pdf");
    			attr_dev(input, "class", "svelte-ku7auo");
    			add_location(input, file$1, 23, 2, 552);
    			attr_dev(span, "id", "spinner");
    			attr_dev(span, "class", "svelte-ku7auo");
    			toggle_class(span, "hidden", !/*loading*/ ctx[1]);
    			add_location(span, file$1, 35, 2, 840);
    			attr_dev(div, "id", "dropzone");
    			attr_dev(div, "class", "svelte-ku7auo");
    			add_location(div, file$1, 22, 1, 529);
    			attr_dev(section, "class", "svelte-ku7auo");
    			add_location(section, file$1, 18, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			append_dev(section, div);
    			append_dev(div, input);
    			append_dev(div, t1);
    			if_block1.m(div, null);
    			append_dev(div, t2);
    			append_dev(div, span);
    			mount_component(spinner, span, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[5]),
    					listen_dev(input, "change", /*change_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*message*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t2);
    				}
    			}

    			const spinner_changes = {};
    			if (dirty & /*loading*/ 2) spinner_changes.active = /*loading*/ ctx[1];
    			spinner.$set(spinner_changes);

    			if (dirty & /*loading*/ 2) {
    				toggle_class(span, "hidden", !/*loading*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			destroy_component(spinner);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Uploader", slots, []);
    	let { submit } = $$props;
    	let { loading } = $$props;
    	let { message } = $$props;
    	const dispatch = createEventDispatcher();
    	let files = null;

    	// resets file input
    	const reset = () => {
    		document.querySelector("#file-input").value = null; // resets file input element
    		$$invalidate(3, files = null); // resets file list
    		dispatch("reset");
    	};

    	const writable_props = ["submit", "loading", "message"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Uploader> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(3, files);
    	}

    	const change_handler = () => submit(files && files[0]);

    	$$self.$$set = $$props => {
    		if ("submit" in $$props) $$invalidate(0, submit = $$props.submit);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({
    		submit,
    		loading,
    		message,
    		Spinner,
    		createEventDispatcher,
    		dispatch,
    		files,
    		reset
    	});

    	$$self.$inject_state = $$props => {
    		if ("submit" in $$props) $$invalidate(0, submit = $$props.submit);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    		if ("message" in $$props) $$invalidate(2, message = $$props.message);
    		if ("files" in $$props) $$invalidate(3, files = $$props.files);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [submit, loading, message, files, reset, input_change_handler, change_handler];
    }

    class Uploader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { submit: 0, loading: 1, message: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Uploader",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*submit*/ ctx[0] === undefined && !("submit" in props)) {
    			console.warn("<Uploader> was created without expected prop 'submit'");
    		}

    		if (/*loading*/ ctx[1] === undefined && !("loading" in props)) {
    			console.warn("<Uploader> was created without expected prop 'loading'");
    		}

    		if (/*message*/ ctx[2] === undefined && !("message" in props)) {
    			console.warn("<Uploader> was created without expected prop 'message'");
    		}
    	}

    	get submit() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submit(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Uploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Uploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const studyLevels = {
      Y: "General Studies",
      P: "Basic Studies",
      A: "Intermediate Studies",
      S: "Advanced Studies",
      J: "Postgraduate Studies",
      K: "Language Studies",
      V: "Preparatory Studies",
      H: "Practical Training",
      O: "Study Module",
    };

    const toggleInArr = (arr, item) => {
      const index = arr.indexOf(item);

      if (index !== -1) {
        arr.splice(index, 1);
      } else {
        arr.push(item);
      }

      return arr;
    };

    /* src\components\Analytics\Course.svelte generated by Svelte v3.29.7 */
    const file$2 = "src\\components\\Analytics\\Course.svelte";

    function create_fragment$2(ctx) {
    	let tr;
    	let td0;
    	let t0;
    	let t1;
    	let td1;
    	let a;
    	let t2;
    	let a_href_value;
    	let t3;
    	let td2;
    	let t4;
    	let t5;
    	let td3;
    	let t6;
    	let t7;
    	let td4;
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*date*/ ctx[4].toLocaleDateString() + "";
    	let t10;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			td1 = element("td");
    			a = element("a");
    			t2 = text(/*code*/ ctx[0]);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(/*grade*/ ctx[2]);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(/*credits*/ ctx[3]);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(/*descriptiveLevel*/ ctx[5]);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			attr_dev(td0, "class", "name svelte-5do9a0");
    			add_location(td0, file$2, 13, 1, 278);
    			attr_dev(a, "href", a_href_value = `https://opas.peppi.utu.fi/fi/haku/${/*code*/ ctx[0]}`);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "referrerpolicy", "no-referrer");
    			attr_dev(a, "class", "svelte-5do9a0");
    			add_location(a, file$2, 15, 2, 330);
    			attr_dev(td1, "class", "code svelte-5do9a0");
    			add_location(td1, file$2, 14, 1, 309);
    			attr_dev(td2, "class", "grade svelte-5do9a0");
    			add_location(td2, file$2, 19, 1, 459);
    			attr_dev(td3, "class", "credits svelte-5do9a0");
    			add_location(td3, file$2, 20, 1, 492);
    			attr_dev(td4, "class", "level svelte-5do9a0");
    			add_location(td4, file$2, 21, 1, 529);
    			attr_dev(td5, "class", "date svelte-5do9a0");
    			add_location(td5, file$2, 22, 1, 573);
    			add_location(tr, file$2, 12, 0, 271);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a);
    			append_dev(a, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			if (dirty & /*code*/ 1) set_data_dev(t2, /*code*/ ctx[0]);

    			if (dirty & /*code*/ 1 && a_href_value !== (a_href_value = `https://opas.peppi.utu.fi/fi/haku/${/*code*/ ctx[0]}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*grade*/ 4) set_data_dev(t4, /*grade*/ ctx[2]);
    			if (dirty & /*credits*/ 8) set_data_dev(t6, /*credits*/ ctx[3]);
    			if (dirty & /*descriptiveLevel*/ 32) set_data_dev(t8, /*descriptiveLevel*/ ctx[5]);
    			if (dirty & /*date*/ 16 && t10_value !== (t10_value = /*date*/ ctx[4].toLocaleDateString() + "")) set_data_dev(t10, t10_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Course", slots, []);
    	let { code = "" } = $$props;
    	let { name = "" } = $$props;
    	let { grade = 0 } = $$props;
    	let { credits = 0 } = $$props;
    	let { level = "" } = $$props;
    	let { date = null } = $$props;
    	const writable_props = ["code", "name", "grade", "credits", "level", "date"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Course> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("grade" in $$props) $$invalidate(2, grade = $$props.grade);
    		if ("credits" in $$props) $$invalidate(3, credits = $$props.credits);
    		if ("level" in $$props) $$invalidate(6, level = $$props.level);
    		if ("date" in $$props) $$invalidate(4, date = $$props.date);
    	};

    	$$self.$capture_state = () => ({
    		code,
    		name,
    		grade,
    		credits,
    		level,
    		date,
    		studyLevels,
    		descriptiveLevel
    	});

    	$$self.$inject_state = $$props => {
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("grade" in $$props) $$invalidate(2, grade = $$props.grade);
    		if ("credits" in $$props) $$invalidate(3, credits = $$props.credits);
    		if ("level" in $$props) $$invalidate(6, level = $$props.level);
    		if ("date" in $$props) $$invalidate(4, date = $$props.date);
    		if ("descriptiveLevel" in $$props) $$invalidate(5, descriptiveLevel = $$props.descriptiveLevel);
    	};

    	let descriptiveLevel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*level*/ 64) {
    			 $$invalidate(5, descriptiveLevel = studyLevels[level] || "");
    		}
    	};

    	return [code, name, grade, credits, date, descriptiveLevel, level];
    }

    class Course extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			code: 0,
    			name: 1,
    			grade: 2,
    			credits: 3,
    			level: 6,
    			date: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Course",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get code() {
    		throw new Error("<Course>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set code(value) {
    		throw new Error("<Course>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Course>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Course>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grade() {
    		throw new Error("<Course>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grade(value) {
    		throw new Error("<Course>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get credits() {
    		throw new Error("<Course>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set credits(value) {
    		throw new Error("<Course>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get level() {
    		throw new Error("<Course>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set level(value) {
    		throw new Error("<Course>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Course>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Course>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Used to filter courses based on ResultViewerSettings settings
     * @param {object} course Course
     * @param {object} settings Settings used to filter courses
     */
    function courseFilter(course, settings) {
      // filter course by grade type
      switch (settings.grades) {
        case "all":
        default:
          break;

        case "numeric":
          if (!parseInt(course.grade)) return false;
          break;

        case "pass-fail":
          if (parseInt(course.grade)) return false;
          break;
      }

      // filter by date
      const { start, end } = settings.date_range;
      if (course.date <= new Date(start) || course.date >= new Date(end)) {
        return false;
      }

      // filter by course level
      if (settings.study_levels.length > 0) {
        if (!settings.study_levels.includes(course.level)) return false;
      }

      // TODO: more filters
      return true;
    }

    /* src\components\Analytics\AnalyticsSettings.svelte generated by Svelte v3.29.7 */

    const { Object: Object_1 } = globals;
    const file$3 = "src\\components\\Analytics\\AnalyticsSettings.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i][0];
    	child_ctx[13] = list[i][1];
    	return child_ctx;
    }

    // (26:0) {#if visible}
    function create_if_block$1(ctx) {
    	let form;
    	let fieldset0;
    	let h20;
    	let t1;
    	let label0;
    	let h30;
    	let t3;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t7;
    	let fieldset1;
    	let h21;
    	let t9;
    	let label1;
    	let h31;
    	let t11;
    	let input0;
    	let t12;
    	let label2;
    	let h32;
    	let t14;
    	let input1;
    	let t15;
    	let fieldset2;
    	let h22;
    	let t17;
    	let span;
    	let mounted;
    	let dispose;
    	let each_value = Object.entries(studyLevels);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			fieldset0 = element("fieldset");
    			h20 = element("h2");
    			h20.textContent = "Grades";
    			t1 = space();
    			label0 = element("label");
    			h30 = element("h3");
    			h30.textContent = "Type";
    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "All";
    			option1 = element("option");
    			option1.textContent = "Numeric only";
    			option2 = element("option");
    			option2.textContent = "Pass/Fail only";
    			t7 = space();
    			fieldset1 = element("fieldset");
    			h21 = element("h2");
    			h21.textContent = "Date";
    			t9 = space();
    			label1 = element("label");
    			h31 = element("h3");
    			h31.textContent = "Start date";
    			t11 = space();
    			input0 = element("input");
    			t12 = space();
    			label2 = element("label");
    			h32 = element("h3");
    			h32.textContent = "End date";
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			fieldset2 = element("fieldset");
    			h22 = element("h2");
    			h22.textContent = "Level";
    			t17 = space();
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "svelte-y45635");
    			add_location(h20, file$3, 28, 3, 716);
    			attr_dev(h30, "class", "svelte-y45635");
    			add_location(h30, file$3, 30, 4, 749);
    			option0.__value = "all";
    			option0.value = option0.__value;
    			attr_dev(option0, "class", "svelte-y45635");
    			add_location(option0, file$3, 32, 5, 825);
    			option1.__value = "numeric";
    			option1.value = option1.__value;
    			attr_dev(option1, "class", "svelte-y45635");
    			add_location(option1, file$3, 33, 5, 864);
    			option2.__value = "pass-fail";
    			option2.value = option2.__value;
    			attr_dev(option2, "class", "svelte-y45635");
    			add_location(option2, file$3, 34, 5, 916);
    			attr_dev(select, "class", "svelte-y45635");
    			if (/*gradeFilter*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[6].call(select));
    			add_location(select, file$3, 31, 4, 768);
    			attr_dev(label0, "class", "svelte-y45635");
    			add_location(label0, file$3, 29, 3, 736);
    			attr_dev(fieldset0, "class", "_50 svelte-y45635");
    			attr_dev(fieldset0, "id", "grades");
    			add_location(fieldset0, file$3, 27, 2, 677);
    			attr_dev(h21, "class", "svelte-y45635");
    			add_location(h21, file$3, 39, 3, 1050);
    			attr_dev(h31, "class", "svelte-y45635");
    			add_location(h31, file$3, 41, 4, 1081);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "max", /*endDate*/ ctx[3]);
    			attr_dev(input0, "class", "svelte-y45635");
    			add_location(input0, file$3, 42, 4, 1106);
    			attr_dev(label1, "class", "svelte-y45635");
    			add_location(label1, file$3, 40, 3, 1068);
    			attr_dev(h32, "class", "svelte-y45635");
    			add_location(h32, file$3, 45, 4, 1214);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "min", /*startDate*/ ctx[2]);
    			attr_dev(input1, "class", "svelte-y45635");
    			add_location(input1, file$3, 46, 4, 1237);
    			attr_dev(label2, "class", "svelte-y45635");
    			add_location(label2, file$3, 44, 3, 1201);
    			attr_dev(fieldset1, "class", "_50 svelte-y45635");
    			attr_dev(fieldset1, "id", "dates");
    			add_location(fieldset1, file$3, 38, 2, 1012);
    			attr_dev(h22, "class", "svelte-y45635");
    			add_location(h22, file$3, 50, 3, 1374);
    			attr_dev(span, "id", "selected-levels");
    			attr_dev(span, "class", "svelte-y45635");
    			add_location(span, file$3, 51, 3, 1393);
    			attr_dev(fieldset2, "class", "_100 svelte-y45635");
    			add_location(fieldset2, file$3, 49, 2, 1346);
    			attr_dev(form, "class", "svelte-y45635");
    			add_location(form, file$3, 26, 1, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, fieldset0);
    			append_dev(fieldset0, h20);
    			append_dev(fieldset0, t1);
    			append_dev(fieldset0, label0);
    			append_dev(label0, h30);
    			append_dev(label0, t3);
    			append_dev(label0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*gradeFilter*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, fieldset1);
    			append_dev(fieldset1, h21);
    			append_dev(fieldset1, t9);
    			append_dev(fieldset1, label1);
    			append_dev(label1, h31);
    			append_dev(label1, t11);
    			append_dev(label1, input0);
    			set_input_value(input0, /*startDate*/ ctx[2]);
    			append_dev(fieldset1, t12);
    			append_dev(fieldset1, label2);
    			append_dev(label2, h32);
    			append_dev(label2, t14);
    			append_dev(label2, input1);
    			set_input_value(input1, /*endDate*/ ctx[3]);
    			append_dev(form, t15);
    			append_dev(form, fieldset2);
    			append_dev(fieldset2, h22);
    			append_dev(fieldset2, t17);
    			append_dev(fieldset2, span);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						select,
    						"blur",
    						function () {
    							if (is_function(/*submit*/ ctx[5])) /*submit*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[6]),
    					listen_dev(
    						input0,
    						"change",
    						function () {
    							if (is_function(/*submit*/ ctx[5])) /*submit*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(
    						input1,
    						"change",
    						function () {
    							if (is_function(/*submit*/ ctx[5])) /*submit*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*gradeFilter*/ 2) {
    				select_option(select, /*gradeFilter*/ ctx[1]);
    			}

    			if (dirty & /*endDate*/ 8) {
    				attr_dev(input0, "max", /*endDate*/ ctx[3]);
    			}

    			if (dirty & /*startDate*/ 4) {
    				set_input_value(input0, /*startDate*/ ctx[2]);
    			}

    			if (dirty & /*startDate*/ 4) {
    				attr_dev(input1, "min", /*startDate*/ ctx[2]);
    			}

    			if (dirty & /*endDate*/ 8) {
    				set_input_value(input1, /*endDate*/ ctx[3]);
    			}

    			if (dirty & /*Object, studyLevels, selectedLevels, toggleInArr*/ 16) {
    				each_value = Object.entries(studyLevels);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(26:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {#each Object.entries(studyLevels) as [levelCode, levelName]}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let input_checked_value;
    	let t0;
    	let h3;
    	let t1_value = /*levelName*/ ctx[13] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*levelCode*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.value = input_value_value = /*levelCode*/ ctx[12];
    			input.checked = input_checked_value = /*selectedLevels*/ ctx[4].indexOf(/*levelCode*/ ctx[12]) !== -1;
    			attr_dev(input, "class", "svelte-y45635");
    			add_location(input, file$3, 54, 6, 1509);
    			add_location(h3, file$3, 60, 6, 1719);
    			attr_dev(label, "class", "svelte-y45635");
    			add_location(label, file$3, 53, 5, 1494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, h3);
    			append_dev(h3, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*selectedLevels*/ 16 && input_checked_value !== (input_checked_value = /*selectedLevels*/ ctx[4].indexOf(/*levelCode*/ ctx[12]) !== -1)) {
    				prop_dev(input, "checked", input_checked_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(53:4) {#each Object.entries(studyLevels) as [levelCode, levelName]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*visible*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AnalyticsSettings", slots, []);
    	let { visible } = $$props;
    	const dispatch = createEventDispatcher();

    	// filter settings
    	let gradeFilter = "all";

    	let startDate = new Date(0);
    	let endDate = new Date();
    	let selectedLevels = [];
    	const writable_props = ["visible"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AnalyticsSettings> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		gradeFilter = select_value(this);
    		$$invalidate(1, gradeFilter);
    	}

    	function input0_input_handler() {
    		startDate = this.value;
    		$$invalidate(2, startDate);
    	}

    	function input1_input_handler() {
    		endDate = this.value;
    		$$invalidate(3, endDate);
    	}

    	const click_handler = levelCode => $$invalidate(4, selectedLevels = toggleInArr(selectedLevels, levelCode));

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		visible,
    		createEventDispatcher,
    		courseFilterFunc: courseFilter,
    		studyLevels,
    		toggleInArr,
    		dispatch,
    		gradeFilter,
    		startDate,
    		endDate,
    		selectedLevels,
    		courseFilter: courseFilter$1,
    		submit
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("gradeFilter" in $$props) $$invalidate(1, gradeFilter = $$props.gradeFilter);
    		if ("startDate" in $$props) $$invalidate(2, startDate = $$props.startDate);
    		if ("endDate" in $$props) $$invalidate(3, endDate = $$props.endDate);
    		if ("selectedLevels" in $$props) $$invalidate(4, selectedLevels = $$props.selectedLevels);
    		if ("courseFilter" in $$props) $$invalidate(10, courseFilter$1 = $$props.courseFilter);
    		if ("submit" in $$props) $$invalidate(5, submit = $$props.submit);
    	};

    	let courseFilter$1;
    	let submit;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*gradeFilter, startDate, endDate, selectedLevels*/ 30) {
    			// TODO: refactor to Analytics.svelte
    			 $$invalidate(10, courseFilter$1 = course => courseFilter(course, {
    				grades: gradeFilter,
    				date_range: { start: startDate, end: endDate },
    				study_levels: selectedLevels
    			}));
    		}

    		if ($$self.$$.dirty & /*courseFilter*/ 1024) {
    			 $$invalidate(5, submit = dispatch("update", courseFilter$1));
    		}
    	};

    	return [
    		visible,
    		gradeFilter,
    		startDate,
    		endDate,
    		selectedLevels,
    		submit,
    		select_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		click_handler
    	];
    }

    class AnalyticsSettings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnalyticsSettings",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*visible*/ ctx[0] === undefined && !("visible" in props)) {
    			console.warn("<AnalyticsSettings> was created without expected prop 'visible'");
    		}
    	}

    	get visible() {
    		throw new Error("<AnalyticsSettings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<AnalyticsSettings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Calculates the GPA of the given courses
     * @param {*} courses
     */
    const gpa = (courses) => {
      // calculate total credits (where the grade is a number)
      const totalCredits = courses.reduce(
        (sum, curr) => (parseInt(curr.grade) ? sum + curr.credits : sum),
        0
      );
      const weightedGrades = courses.reduce(
        (sum, curr) =>
          parseInt(curr.grade) ? sum + curr.credits * curr.grade : sum,
        0
      );

      return totalCredits > 0 ? (weightedGrades / totalCredits).toFixed(2) : "N/A";
    };

    function mostFrequent(courses, func) {
      const arr = courses.slice(0, courses.length);
      const item = arr
        .sort(
          (a, b) =>
            arr.filter((v) => func(v) === func(a)).length -
            arr.filter((v) => func(v) === func(b)).length
        )
        .pop();
      return item ? func(item) : "N/A";
    }

    var stats = {
      gpa,
      mostFrequent,
    };

    /* src\components\Analytics\Analytics.svelte generated by Svelte v3.29.7 */
    const file$4 = "src\\components\\Analytics\\Analytics.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (24:0) {#if courses}
    function create_if_block$2(ctx) {
    	let ul;
    	let li0;
    	let t0;
    	let span0;
    	let t1_value = /*courseStats*/ ctx[4].gpa + "";
    	let t1;
    	let t2;
    	let li1;
    	let t3;
    	let span1;
    	let t4_value = /*courseStats*/ ctx[4].most_frequent + "";
    	let t4;
    	let t5;
    	let li2;
    	let t6;
    	let span2;
    	let t7_value = /*courseStats*/ ctx[4].credits + "";
    	let t7;
    	let t8;
    	let div0;
    	let input0;
    	let t9;
    	let input1;
    	let t10;
    	let div1;
    	let settings;
    	let t11;
    	let table;
    	let current;
    	let mounted;
    	let dispose;

    	settings = new AnalyticsSettings({
    			props: { visible: /*showSettings*/ ctx[2] },
    			$$inline: true
    		});

    	settings.$on("update", /*handleFilterUpdate*/ ctx[5]);
    	let if_block = /*showCourses*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text("GPA: ");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			li1 = element("li");
    			t3 = text("Most frequent grade: ");
    			span1 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			li2 = element("li");
    			t6 = text("Credits: ");
    			span2 = element("span");
    			t7 = text(t7_value);
    			t8 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			div1 = element("div");
    			create_component(settings.$$.fragment);
    			t11 = space();
    			table = element("table");
    			if (if_block) if_block.c();
    			attr_dev(span0, "class", "val svelte-oj6grb");
    			attr_dev(span0, "title", "Pass/Fail courses do not count towards GPA");
    			add_location(span0, file$4, 25, 11, 745);
    			attr_dev(li0, "class", "svelte-oj6grb");
    			add_location(li0, file$4, 25, 2, 736);
    			attr_dev(span1, "class", "val svelte-oj6grb");
    			add_location(span1, file$4, 26, 27, 872);
    			attr_dev(li1, "class", "svelte-oj6grb");
    			add_location(li1, file$4, 26, 2, 847);
    			attr_dev(span2, "class", "val svelte-oj6grb");
    			add_location(span2, file$4, 27, 15, 946);
    			attr_dev(li2, "class", "svelte-oj6grb");
    			add_location(li2, file$4, 27, 2, 933);
    			attr_dev(ul, "id", "analytics");
    			attr_dev(ul, "class", "svelte-oj6grb");
    			add_location(ul, file$4, 24, 1, 713);
    			attr_dev(input0, "type", "submit");
    			input0.value = "Courses";
    			attr_dev(input0, "class", "svelte-oj6grb");
    			toggle_class(input0, "selected", /*showCourses*/ ctx[1]);
    			add_location(input0, file$4, 30, 2, 1031);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Settings";
    			attr_dev(input1, "class", "svelte-oj6grb");
    			toggle_class(input1, "selected", /*showSettings*/ ctx[2]);
    			add_location(input1, file$4, 39, 2, 1222);
    			attr_dev(div0, "id", "controls");
    			attr_dev(div0, "class", "svelte-oj6grb");
    			add_location(div0, file$4, 29, 1, 1008);
    			add_location(table, file$4, 53, 2, 1523);
    			attr_dev(div1, "id", "details");
    			attr_dev(div1, "class", "svelte-oj6grb");
    			add_location(div1, file$4, 48, 1, 1420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(li0, span0);
    			append_dev(span0, t1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, t3);
    			append_dev(li1, span1);
    			append_dev(span1, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, t6);
    			append_dev(li2, span2);
    			append_dev(span2, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input0);
    			append_dev(div0, t9);
    			append_dev(div0, input1);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(settings, div1, null);
    			append_dev(div1, t11);
    			append_dev(div1, table);
    			if (if_block) if_block.m(table, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "click", prevent_default(/*click_handler*/ ctx[6]), false, true, false),
    					listen_dev(input1, "click", prevent_default(/*click_handler_1*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*courseStats*/ 16) && t1_value !== (t1_value = /*courseStats*/ ctx[4].gpa + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*courseStats*/ 16) && t4_value !== (t4_value = /*courseStats*/ ctx[4].most_frequent + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*courseStats*/ 16) && t7_value !== (t7_value = /*courseStats*/ ctx[4].credits + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*showCourses*/ 2) {
    				toggle_class(input0, "selected", /*showCourses*/ ctx[1]);
    			}

    			if (dirty & /*showSettings*/ 4) {
    				toggle_class(input1, "selected", /*showSettings*/ ctx[2]);
    			}

    			const settings_changes = {};
    			if (dirty & /*showSettings*/ 4) settings_changes.visible = /*showSettings*/ ctx[2];
    			settings.$set(settings_changes);

    			if (/*showCourses*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showCourses*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(table, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div1);
    			destroy_component(settings);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(24:0) {#if courses}",
    		ctx
    	});

    	return block;
    }

    // (55:3) {#if showCourses}
    function create_if_block_1$1(ctx) {
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let current;
    	let each_value = /*filteredCourses*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Name";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Code";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Grade";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Credits";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Level";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Date";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "class", "svelte-oj6grb");
    			add_location(th0, file$4, 57, 5, 1581);
    			attr_dev(th1, "class", "svelte-oj6grb");
    			add_location(th1, file$4, 58, 5, 1601);
    			attr_dev(th2, "class", "svelte-oj6grb");
    			add_location(th2, file$4, 59, 5, 1621);
    			attr_dev(th3, "class", "svelte-oj6grb");
    			add_location(th3, file$4, 60, 5, 1642);
    			attr_dev(th4, "class", "svelte-oj6grb");
    			add_location(th4, file$4, 61, 5, 1665);
    			attr_dev(th5, "class", "svelte-oj6grb");
    			add_location(th5, file$4, 62, 5, 1686);
    			add_location(tr, file$4, 56, 4, 1570);
    			add_location(thead, file$4, 55, 3, 1557);
    			add_location(tbody, file$4, 65, 3, 1728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filteredCourses*/ 8) {
    				each_value = /*filteredCourses*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(55:3) {#if showCourses}",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#each filteredCourses as course}
    function create_each_block$1(ctx) {
    	let course;
    	let current;
    	const course_spread_levels = [/*course*/ ctx[9]];
    	let course_props = {};

    	for (let i = 0; i < course_spread_levels.length; i += 1) {
    		course_props = assign(course_props, course_spread_levels[i]);
    	}

    	course = new Course({ props: course_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(course.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(course, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const course_changes = (dirty & /*filteredCourses*/ 8)
    			? get_spread_update(course_spread_levels, [get_spread_object(/*course*/ ctx[9])])
    			: {};

    			course.$set(course_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(course.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(course.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(course, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(67:4) {#each filteredCourses as course}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*courses*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*courses*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*courses*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Analytics", slots, []);
    	let { courses } = $$props;
    	let showCourses = true;
    	let showSettings = false;
    	let courseFilter = () => true;
    	const handleFilterUpdate = ns => $$invalidate(8, courseFilter = ns.detail);
    	const writable_props = ["courses"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Analytics> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, showCourses = !showCourses);
    		$$invalidate(2, showSettings = false);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(2, showSettings = !showSettings);
    		$$invalidate(1, showCourses = false);
    	};

    	$$self.$$set = $$props => {
    		if ("courses" in $$props) $$invalidate(0, courses = $$props.courses);
    	};

    	$$self.$capture_state = () => ({
    		courses,
    		Course,
    		Settings: AnalyticsSettings,
    		stats,
    		showCourses,
    		showSettings,
    		courseFilter,
    		handleFilterUpdate,
    		filteredCourses,
    		courseStats
    	});

    	$$self.$inject_state = $$props => {
    		if ("courses" in $$props) $$invalidate(0, courses = $$props.courses);
    		if ("showCourses" in $$props) $$invalidate(1, showCourses = $$props.showCourses);
    		if ("showSettings" in $$props) $$invalidate(2, showSettings = $$props.showSettings);
    		if ("courseFilter" in $$props) $$invalidate(8, courseFilter = $$props.courseFilter);
    		if ("filteredCourses" in $$props) $$invalidate(3, filteredCourses = $$props.filteredCourses);
    		if ("courseStats" in $$props) $$invalidate(4, courseStats = $$props.courseStats);
    	};

    	let filteredCourses;
    	let courseStats;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*courses, courseFilter*/ 257) {
    			// courses filtered by settings
    			 $$invalidate(3, filteredCourses = courses ? courses.filter(courseFilter) : []);
    		}

    		if ($$self.$$.dirty & /*filteredCourses*/ 8) {
    			// statistics for the visible courses
    			 $$invalidate(4, courseStats = {
    				gpa: stats.gpa(filteredCourses),
    				most_frequent: stats.mostFrequent(filteredCourses, course => course.grade),
    				credits: filteredCourses.reduce((sum, curr) => sum + curr.credits, 0)
    			});
    		}
    	};

    	return [
    		courses,
    		showCourses,
    		showSettings,
    		filteredCourses,
    		courseStats,
    		handleFilterUpdate,
    		click_handler,
    		click_handler_1
    	];
    }

    class Analytics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { courses: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Analytics",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*courses*/ ctx[0] === undefined && !("courses" in props)) {
    			console.warn("<Analytics> was created without expected prop 'courses'");
    		}
    	}

    	get courses() {
    		throw new Error("<Analytics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set courses(value) {
    		throw new Error("<Analytics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Attempts to analyze a PDF file
     * @param {File} file
     */
    async function analyzePDF(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // parse after reading file contents
        reader.onload = async () => {
          try {
            const parsedData = await parse(reader.result);
            resolve(parsedData);
          } catch (parseErr) {
            reject(parseErr);
          }
        };

        // reads file contents as base64
        reader.readAsDataURL(file);
      });
    }

    /**
     * Parses the PDF file for course info
     * @param {String} data
     */
    async function parse(data) {
      // parse PDF document from base64 data
      const loadingTask = pdfjsLib.getDocument(data);
      const pdf = await loadingTask.promise;

      let result = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        await pdf.getPage(pageNum).then(async (page) => {
          const items = (await page.getTextContent()).items; // array of all text items on page

          const itemIndexes = getItemIndexes(items, courseNumberRegexp);
          if (itemIndexes.length === 0) {
            throw new Error("no courses found");
          }

          itemIndexes.forEach((i) => {
            result.push(getCourseDetails(items, i));
          });
        });
      }

      return result;
    }

    const getItemIndexes = (items, pattern) =>
      items.reduce((arr, item) => {
        if (pattern.test(item.str)) {
          arr.push(items.indexOf(item));
        }
        return arr;
      }, []);

    /**
     * Returns all the available details for a course based on the given index.
     * @param {*} items Array of PDF text items
     * @param {*} index Index of the course code in the array
     */
    const getCourseDetails = (items, index) => {
      const [code, name, credits, level, grade, date] = items.slice(
        index,
        index + 6
      );

      const [day, month, year] = date.str.split(".");

      return {
        code: code.str,
        name: name.str,
        credits: parseInt(credits.str),
        level: level.str,
        grade: grade.str,
        date: new Date(year, month - 1, day),
      };
    };

    /*
     * Regular expressions used to find specific items
     */
    const courseNumberRegexp = /\w{4}\d{4}/;

    /* src\App.svelte generated by Svelte v3.29.7 */
    const file$5 = "src\\App.svelte";

    function create_fragment$5(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let main;
    	let header;
    	let h1;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let span2;
    	let a;
    	let t6;
    	let article;
    	let section0;
    	let uploader;
    	let t7;
    	let section1;
    	let analytics;
    	let current;

    	uploader = new Uploader({
    			props: {
    				submit: /*analyze*/ ctx[3],
    				loading: /*loading*/ ctx[0],
    				message: /*errMessage*/ ctx[1]
    			},
    			$$inline: true
    		});

    	uploader.$on("reset", /*reset_handler*/ ctx[4]);

    	analytics = new Analytics({
    			props: { courses: /*parsedData*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			main = element("main");
    			header = element("header");
    			h1 = element("h1");
    			span0 = element("span");
    			span0.textContent = "Nettiopsu";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Analytics";
    			t4 = space();
    			span2 = element("span");
    			a = element("a");
    			a.textContent = "?";
    			t6 = space();
    			article = element("article");
    			section0 = element("section");
    			create_component(uploader.$$.fragment);
    			t7 = space();
    			section1 = element("section");
    			create_component(analytics.$$.fragment);
    			if (script.src !== (script_src_value = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "integrity", "sha512-Z8CqofpIcnJN80feS2uccz+pXWgZzeKxDsDNMD/dJ6997/LSRY+W4NmEt9acwR+Gt9OHN0kkI1CTianCwoqcjQ==");
    			attr_dev(script, "crossorigin", "anonymous");
    			add_location(script, file$5, 1, 2, 17);
    			attr_dev(span0, "id", "title-1");
    			attr_dev(span0, "class", "svelte-1jhsyd7");
    			add_location(span0, file$5, 36, 3, 933);
    			attr_dev(span1, "id", "title-2");
    			attr_dev(span1, "class", "svelte-1jhsyd7");
    			add_location(span1, file$5, 36, 39, 969);
    			add_location(h1, file$5, 35, 2, 924);
    			attr_dev(a, "class", "button");
    			attr_dev(a, "href", "help.html");
    			attr_dev(a, "title", "Help");
    			add_location(a, file$5, 39, 3, 1046);
    			attr_dev(span2, "id", "info-buttons");
    			attr_dev(span2, "class", "svelte-1jhsyd7");
    			add_location(span2, file$5, 38, 2, 1017);
    			attr_dev(header, "class", "svelte-1jhsyd7");
    			toggle_class(header, "small", /*parsedData*/ ctx[2] !== null);
    			add_location(header, file$5, 34, 1, 878);
    			attr_dev(section0, "id", "uploader");
    			attr_dev(section0, "class", "svelte-1jhsyd7");
    			toggle_class(section0, "small", /*parsedData*/ ctx[2] !== null);
    			add_location(section0, file$5, 47, 2, 1158);
    			attr_dev(section1, "id", "results");
    			attr_dev(section1, "class", "svelte-1jhsyd7");
    			toggle_class(section1, "small", /*parsedData*/ ctx[2] === null);
    			add_location(section1, file$5, 58, 2, 1442);
    			add_location(article, file$5, 46, 1, 1145);
    			attr_dev(main, "class", "svelte-1jhsyd7");
    			toggle_class(main, "small", /*parsedData*/ ctx[2] === null);
    			add_location(main, file$5, 33, 0, 835);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, h1);
    			append_dev(h1, span0);
    			append_dev(h1, t2);
    			append_dev(h1, span1);
    			append_dev(header, t4);
    			append_dev(header, span2);
    			append_dev(span2, a);
    			append_dev(main, t6);
    			append_dev(main, article);
    			append_dev(article, section0);
    			mount_component(uploader, section0, null);
    			append_dev(article, t7);
    			append_dev(article, section1);
    			mount_component(analytics, section1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*parsedData*/ 4) {
    				toggle_class(header, "small", /*parsedData*/ ctx[2] !== null);
    			}

    			const uploader_changes = {};
    			if (dirty & /*loading*/ 1) uploader_changes.loading = /*loading*/ ctx[0];
    			if (dirty & /*errMessage*/ 2) uploader_changes.message = /*errMessage*/ ctx[1];
    			uploader.$set(uploader_changes);

    			if (dirty & /*parsedData*/ 4) {
    				toggle_class(section0, "small", /*parsedData*/ ctx[2] !== null);
    			}

    			const analytics_changes = {};
    			if (dirty & /*parsedData*/ 4) analytics_changes.courses = /*parsedData*/ ctx[2];
    			analytics.$set(analytics_changes);

    			if (dirty & /*parsedData*/ 4) {
    				toggle_class(section1, "small", /*parsedData*/ ctx[2] === null);
    			}

    			if (dirty & /*parsedData*/ 4) {
    				toggle_class(main, "small", /*parsedData*/ ctx[2] === null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uploader.$$.fragment, local);
    			transition_in(analytics.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uploader.$$.fragment, local);
    			transition_out(analytics.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(uploader);
    			destroy_component(analytics);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let loading = false;
    	let errMessage = null;
    	let parsedData = null;

    	// parses the PDF and extracts all course data from it
    	async function analyze(file) {
    		if (!file) return;

    		try {
    			$$invalidate(0, loading = true);
    			$$invalidate(2, parsedData = await analyzePDF(file));
    			$$invalidate(1, errMessage = null);
    		} catch(err) {
    			$$invalidate(1, errMessage = err);
    		} finally {
    			$$invalidate(0, loading = false);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const reset_handler = () => {
    		$$invalidate(2, parsedData = null);
    		$$invalidate(1, errMessage = null);
    	};

    	$$self.$capture_state = () => ({
    		Uploader,
    		Analytics,
    		analyzePDF,
    		loading,
    		errMessage,
    		parsedData,
    		analyze
    	});

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    		if ("errMessage" in $$props) $$invalidate(1, errMessage = $$props.errMessage);
    		if ("parsedData" in $$props) $$invalidate(2, parsedData = $$props.parsedData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loading, errMessage, parsedData, analyze, reset_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
