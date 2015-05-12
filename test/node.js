var newick = require ("tnt.newick");
var tnt_node = require("../index.js");
var assert = require("chai").assert;
var _ = require("underscore");

var _t = {"tree":{"events":{"type":"speciation"},"branch_length":0,"children":[{"events":{"type":"speciation"},"branch_length":0.290309,"children":[{"events":{"type":"duplication"},"branch_length":0.553716,"children":[{"sequence":{"location":"groupV:2282380-2283414","id":[{"source":"EnsEMBL","accession":"ENSGACP00000004057"}]},"branch_length":0.009886,"id":{"source":"EnsEMBL","accession":"ENSGACG00000003104"},"taxonomy":{"scientific_name":"Gasterosteus aculeatus","id":69293}},{"sequence":{"location":"groupIV:26610147-26611181","id":[{"source":"EnsEMBL","accession":"ENSGACP00000025919"}]},"branch_length":0.010517,"id":{"source":"EnsEMBL","accession":"ENSGACG00000019610"},"taxonomy":{"scientific_name":"Gasterosteus aculeatus","id":69293}}],"confidence":{"value":100,"type":"boostrap"},"taxonomy":{"scientific_name":"Gasterosteus aculeatus","id":69293}},{"sequence":{"location":"3:10019898-10027054","id":[{"source":"EnsEMBL","accession":"ENSORLP00000002154"}]},"branch_length":0.799164,"id":{"source":"EnsEMBL","accession":"ENSORLG00000001736"},"taxonomy":{"scientific_name":"Oryzias latipes","id":8090}}],"confidence":{"value":100,"type":"boostrap"},"taxonomy":{"scientific_name":"Smegmamorpha","id":129949}},{"events":{"type":"duplication"},"branch_length":0.967267,"children":[{"events":{"type":"duplication"},"branch_length":0.044409,"children":[{"sequence":{"location":"LG11:12303551-12304465","id":[{"source":"EnsEMBL","accession":"ENSLOCP00000005677"}]},"branch_length":0.053459,"id":{"source":"EnsEMBL","accession":"ENSLOCG00000004738"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}},{"sequence":{"location":"LG4:788515-789902","id":[{"source":"EnsEMBL","accession":"ENSLOCP00000001145"}]},"branch_length":0.077798,"id":{"source":"EnsEMBL","accession":"ENSLOCG00000001021"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}}],"confidence":{"value":63,"type":"boostrap"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}},{"sequence":{"location":"LG7:27649875-27652376","id":[{"source":"EnsEMBL","accession":"ENSLOCP00000017148"}]},"branch_length":0.008044,"id":{"source":"EnsEMBL","accession":"ENSLOCG00000013911"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}}],"confidence":{"value":63,"type":"boostrap"},"taxonomy":{"scientific_name":"Lepisosteus oculatus","id":7918}}],"taxonomy":{"scientific_name":"Neopterygii","id":41665}},"rooted":1,"id":"ENSGT00540000072363","type":"gene tree"};

var newick_str = "((human, chimp), mouse)";
var tree = newick.parse_newick(newick_str);
describe ('TnT node', function () {
    var mytree = tnt_node(tree);
    it ("Can create trees", function () {
	assert.isDefined(mytree);
    })

    it ("Can create trees from JSON objects", function () {
	var this_tree = tnt_node(_t.tree);
	assert.isDefined(this_tree);
	assert.isDefined(this_tree.children);
    });

    it ("Can return the original data", function () {
	var mytree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	var mynewtree = tnt_node(mytree);
	assert.property(mytree, "name");
	var orig_data = mynewtree.data();
	assert.deepEqual(mytree, orig_data);
	assert.strictEqual(mynewtree.data().name, "anc2");
    });

    it ('Inserts ids in all the nodes', function () {
	var nodes_with_ids = 0;
	var nodes = 0;
	mytree.apply(function (node) {
	    nodes++;
	    if (node.property('_id') !== undefined) {
		nodes_with_ids++;
	    }
	});
	assert.equal(nodes_with_ids, nodes);
    });

    it ("Doesn't override ids", function () {
	var node = mytree.find_node_by_name('human');
	assert.notEqual(node.property('_id'), 1);
	assert.strictEqual(node.property('_id'), 3);
    });

    it("Can retrieve ids", function () {
	assert.property(mytree, "id");
	var id = mytree.id();
	assert.isDefined(id);
	assert.strictEqual(id, 1);
    });

    it("Can retrieve names", function () {
	assert.property(mytree, "node_name");
	var root_name = mytree.node_name();
	assert.strictEqual(root_name, "");
	var node = mytree.find_node_by_name('chimp');
	var node_name = node.node_name();
	assert.strictEqual(node_name, 'chimp');
    });
    
    it('Has the correct number of parents', function () {
	var parents = 0;
	var nodes = 0;
	mytree.apply(function (node) {
	    nodes++;
	    if (node.property('_parent') !== undefined) {
		parents++;
		}
	});
	assert.strictEqual(parents+1, nodes);
    });

    it('Inserts correct distances to root', function () {
	var newick_str = "((human:0.2,chimp:0.3):0.2,mouse:0.5)";
	var data = newick.parse_newick(newick_str);
	var tree = tnt_node(data);
	assert.isDefined(tree.root_dist);
	assert.isFunction(tree.root_dist);
	var root_dists = [];
	tree.apply(function (node) {
	    root_dists.push(node.root_dist());
	});
	var undef_dists = _.filter(root_dists, function(d) {return d === undefined});
	assert.strictEqual(undef_dists.length, 0);
	var human = tree.find_node_by_name('human');
	assert.closeTo(human.root_dist(),0.4, 0.01);
    });

    describe('API', function () {

	describe('data', function () {
	    // data can only be used to retrieve the data or to use new data
	    var newick1 = "((human, chimp), mouse)root1";
	    var newick2 = "((human, chimp), mouse)root2";
	    var root = tnt_node (newick.parse_newick(newick1));
	    var data1 = root.data();
	    assert.isDefined(data1);
	    assert.isObject(data1);
	    assert.equal(data1.name, "root1");
	    root.data(newick.parse_newick(newick2));
	    var data2 = root.data();
	    assert.equal(data2.name, "root2");
	    
	});
	
	describe('property', function () {
	    var tree_obj = {
	    	name: "F",
	    	deeper : { field : 1 },
	    	children: [
	    	    {name: "A", length: 0.1},
	    	    {name: "B", length: 0.2},
	    	    {
	    		name: "E",
	    		length: 0.5,
	    		branchset: [
	    		    {name: "C", length: 0.3},
	    		    {name: "D", length: 0.4}
	    		]
	    	    }
	    	]
	    };

	    var root = tnt_node(tree_obj);
	    it ('Accesses data properties', function () {
	    	var prop1 = root.property('name');
	    	assert.strictEqual (prop1, 'F');
	    });

	    it ('Sets data properties', function () {
		root.property('new_prop', 'aa');
		assert.strictEqual (root.property('new_prop'), 'aa');
	    });

	    it ('Accepts a callback for accessing properties', function () {
		var deep_prop = root.property(function (node) {
		    return node.deeper.field
		})
		assert.strictEqual (deep_prop, 1);
	    });

	    it ('Accepts a callback for setting properties', function () {
		root.property(function (node, val) {
		    node.deeper.new_deep = val
		}, 'bb');
		assert.strictEqual (root.property (function (node) {
		    return node.deeper.new_deep;
		}), 'bb');
	    });

	    it ('Returs undefined for non existent properties', function () {
		assert.isUndefined(root.property("__thisPropertyDoesNotExist__"));
	    });

	});

	describe('branch_length', function () {
	    it ("Returns the branch length of a node", function () {
		var tree_from_newick = tnt_node(newick.parse_newick("((human:0.3, chimp:0.2):0.5,mouse:0.6):0.1"));
		var human = tree_from_newick.find_node_by_name("human");
		var branch_length = human.branch_length();
		assert.isDefined(branch_length);
		assert.closeTo(branch_length, 0.3, 0.0001);
	    });
	    it ("Returns undefined if the node does not have branch length defined", function () {
		var tree_from_newick = tnt_node(newick.parse_newick("((human,chimp),mouse)"));
		var human = tree_from_newick.find_node_by_name("human");
		assert.isUndefined(human.branch_length());
	    });
	});

	describe('root_dist', function () {
	    it ("Returns the distance to root of a node", function () {
		var tree_from_newick = tnt_node(newick.parse_newick("((human:0.3, chimp:0.2):0.5,mouse:0.6):0.1"));
		var human = tree_from_newick.find_node_by_name("human");
		var root_dist = human.root_dist();
		assert.isDefined(root_dist);
		assert.closeTo(root_dist, 0.8, 0.0001);
	    })
	});
	
	describe('find_node', function () {
	    var tree_from_newick = tnt_node(newick.parse_newick("((human,chimp)anc1,mouse)anc2"));

	    it ("Finds a node by shallow attribute", function () {
		assert.isDefined (tree_from_newick);
		assert.typeOf (tree_from_newick, 'function');

		var human_node = tree_from_newick.find_node (function (node) {
		    return (node.node_name() === 'human');
		});
		assert.isDefined (human_node);
		assert.strictEqual(human_node.node_name(), 'human');
	    });

	    var tree_from_json   = tnt_node(_t.tree);
	    it ("Finds a node by a deep attribute", function () {
		assert.isDefined (tree_from_json);
		assert.typeOf (tree_from_json, 'function');
		var n = tree_from_json.find_node (function (node) {
		    return node.is_leaf() && node.data().id.accession === "ENSGACG00000003104";
		});
		assert.isDefined(n);
		assert.strictEqual(n.data().id.accession, "ENSGACG00000003104");
	    });

	    it ("Finds nodes under collapsed nodes if deep argument is true", function () {
		var newick_str = "((human, chimp)anc1, mouse)anc2";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.toggle();
		var human = root.find_node (function (n) {
		    //return true;
		    return n.node_name() === "human";
		}, true); // deep
		assert.isDefined(human);
	    });
	});

	describe('find_node_by_name', function () {
	    var newtree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	    var mynewtree = tnt_node(newtree);

	    it("Returns the correct node", function () {
		assert.isDefined(newtree);
		var node = mytree.find_node_by_name("human");
		assert.isDefined(node);
		assert.strictEqual(node.data().name, "human");
		var node2 = mytree.find_node_by_name("mouse");
		assert.isDefined(node2);
		assert.strictEqual(node2.data().name, "mouse");
	    });
	    
	    it("Can search for the root", function () {
		assert.isDefined(mynewtree);
		var root = mynewtree.find_node_by_name("anc2");
		assert.isDefined(root);
		assert.strictEqual(root.data().name, "anc2");
	    });
	    
	    it("Returns nodes that are tnt.tree.node's", function () {
		var node = mynewtree.find_node_by_name('anc1');
		assert.property(node, 'find_node_by_name');
	    });

	    it("Finds nodes under collapsed nodes if deep argument is true", function () {
		var newick_str = "((human, chimp)anc1, mouse)anc2";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.toggle();
		assert.isUndefined(root.find_node_by_name('human'));
		assert.isDefined(root.find_node_by_name('human', true));
		assert.equal(root.find_node_by_name('human', true).node_name(), "human");
	    });
	});

	describe('find_all', function () {
	    var newtree = newick.parse_newick("((human,chimp)anc1,human)anc2");
	    var mynewtree = tnt_node(newtree);
	    it ("Exists", function () {
		assert.isDefined(mynewtree);
		assert.isDefined(mynewtree.find_all);
	    });
	    it ("returns all the nodes satisfying the argument", function () {
		var nodes = mynewtree.find_all(function (node) {
		    return node.node_name() === "human";
		});
		assert.equal (nodes.length, 2);
	    });
	});
	
	describe('apply', function () {
	    it("Sets a new property on each downstream node", function () {
		mytree.apply(function (node) {node.property('__test__', 1)})
		var tested = 0;
		var with_prop = 0;
		mytree.apply(function (node) {
		    tested++;
		    if (node.property('__test__') !== undefined) {
			with_prop++;
		    }
		});
		assert.strictEqual(tested, with_prop);
		assert.strictEqual(with_prop, 5);
	    });
	    
	    it ("Does not apply to collapsed nodes by default", function () {
		var newick_str = "((human, chimp)primates, (mouse, rat)rodents)mammals";
		var root = tnt_node(newick.parse_newick(newick_str));
		var primates = root.find_node_by_name("primates");
		var human = root.find_node_by_name ("human");

		primates.toggle();
		root.apply(function (node) {
		    node.property("__test__", 1)
		});
		assert.isDefined(human);
		assert.isUndefined(human.property('__test__'));
		assert.isDefined(primates.property('__test__'));
	    });

	    it ("Does apply to collapsed nodes if specified", function () {
		var newick_str = "((human, chimp)primates, (mouse, rat)rodents)mammals";
		var root = tnt_node(newick.parse_newick(newick_str));
		var primates = root.find_node_by_name ('primates');
		var human = root.find_node_by_name('human');

		primates.toggle();
		root.apply(function (node) {
		    node.property("__test__", 1);
		}, true); // deep
		assert.isDefined(human);
		assert.isDefined(primates.property('__test__'));
		assert.isDefined(human.property('__test__'));
	    });
	});

	describe('lca', function () {
	    var newtree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	    var mynewtree = tnt_node(newtree);

	    it("Finds the correct lca node", function () {
		var nodes = [];
		nodes.push(mynewtree.find_node_by_name('human'));
		nodes.push(mynewtree.find_node_by_name('chimp'));
		var lca = mynewtree.lca(nodes);
		assert.isDefined(lca);
		assert.property(lca, "find_node_by_name");
	    })
	});

	describe('is_leaf', function () {
	    var newtree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	    var mynewtree = tnt_node(newtree);
	    it("Returns the correct number of leaves", function () {
		var leaves = 0;
		mynewtree.apply(function(node) {
		    if (node.is_leaf()) {
			leaves++;
		    }
		});
		assert.strictEqual(leaves, 3);
	    });
	    it("Does take into account collapsed nodes if specified", function () {
		var newick_str = "((human, chimp)primates, (mouse, rat)rodents)mammals";
		var root = tnt_node(newick.parse_newick(newick_str));
		assert.isFalse(root.is_leaf());
		root.toggle();
		assert.isTrue(root.is_leaf());
		assert.isFalse(root.is_leaf(true));
	    });
	});

	describe('toggle', function () {
	    var newickStr = "((human, chimp)primates, (mouse, rat)rodents)mammals";
	    it ("hides nodes", function () {
		var root = tnt_node (newick.parse_newick(newickStr));
		var rodents = root.find_node_by_name("rodents");
		rodents.toggle();
		assert.isUndefined(rodents.property("children"));
		assert.isDefined(rodents.property("_children"));
	    });
	    it ("un-hides nodes", function () {
		var root = tnt_node (newick.parse_newick(newickStr));
		var rodents = root.find_node_by_name("rodents");
		rodents.toggle().toggle();
		assert.isUndefined(rodents.property("_children"));
		assert.isDefined(rodents.property("children"));

	    });
	});

	describe('is_collapsed', function () {
	    var newickStr = "((human, chimp)primates, (mouse, rat)rodents)mammals";
	    var root = tnt_node (newick.parse_newick(newickStr));
	    it ("Returns true on collapsed nodes", function () {
		var rodents = root.find_node_by_name("rodents");
		rodents.toggle();
		assert.isTrue (rodents.is_collapsed());
		rodents.toggle();
		assert.isFalse (rodents.is_collapsed());
	    });
	    it ("Returns false on real leaves", function () {
		var human = root.find_node_by_name("human");
		assert.isFalse (human.is_collapsed());
	    });
	    it ("Returns false on un-collapsed nodes with collapsed ancestors", function () {
		var mammals = root.find_node_by_name("mammals");
		var chimp = root.find_node_by_name("chimp");
		mammals.toggle();
		assert.isFalse (chimp.is_collapsed());		
	    });
	});

	describe ('n_hidden', function () {
	    var newickStr = "((human, chimp)primates, (mouse, rat)rodents)mammals";
	    it ("Returns the correct number of hidden nodes under a collapsed node", function () {
		var root = tnt_node (newick.parse_newick (newickStr));
		var primates = root.find_node_by_name ('primates');
		primates.toggle();
		assert.strictEqual (primates.n_hidden(), 2);
	    });
	});

	describe('parent', function () {
	    var newtree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	    var mynewtree = tnt_node(newtree);
	    var node = mynewtree.find_node_by_name("anc1");
	    var parent = node.parent();
	    it("Can take parents from nodes", function () {
		assert.isDefined(parent);
	    });
	    it("Returns the right node", function () {
		assert.strictEqual(parent.data().name, "anc2");
	    });
	    it("Returns an tnt.tree.node object", function () {
		assert.property(parent, "is_leaf");
	    });
	    it("Returns undefined parent on root", function () {
		var node = mynewtree.parent();
		assert.isUndefined(node);
	    });
	});

	describe('children', function () {
	    var newtree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	    var mynewtree = tnt_node(newtree);

	    var node = mynewtree.find_node_by_name("anc1");
	    var children = node.children();
	    it("Can take children from nodes", function () {
		assert.isDefined(children);
	    });
	    it("Returns a list of children", function () {
		assert.isArray(children);
	    });
	    it("Returns a list of tnt.tree.node's", function () {
		_.each(children, function (el) {
		    assert.property(el, "is_leaf");
		});
	    });
	    it("Returns undefined children on leaves", function () {
		var node = mynewtree.find_node_by_name("mouse");
		var children = node.children();
		assert.isUndefined(children);
	    });
	    it("Returns collapsed children if deep argument is set", function () {
		var newick_str = "((human, chimp)anc1, mouse)anc2";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.toggle();
		assert.isUndefined(root.children());
		assert.lengthOf(root.children(true), 2);
	    });
	});

	describe('upstream', function() {
	    var mytree = newick.parse_newick("((human,chimp)anc1,mouse)anc2");
	    var mynewtree = tnt_node(mytree);
	    var node = mynewtree.find_node_by_name('human');
	    it("Visits the correct number of antecesors", function () {
		var visited_parents = [];
		node.upstream(function (el) {
		    visited_parents.push(el.property('name'));
		});
		assert.strictEqual(visited_parents.length, 3);
		assert.isTrue(_.contains(visited_parents, "human"));
		assert.isTrue(_.contains(visited_parents, "anc2"));
		assert.isTrue(_.contains(visited_parents, "anc1"));
	    });
	    it("Sets properties in the antecesors", function () {
		node.upstream(function (el) {
		    el.property('visited_node', 1);
		});
		var visited_nodes = [];
		mynewtree.apply(function (node) {
		    if (node.property('visited_node') === 1) {
			visited_nodes.push(node.data().name);
		    }
		});
		assert.strictEqual(visited_nodes.length, 3);
		assert.isTrue(_.contains(visited_nodes, "human"));
		assert.isTrue(_.contains(visited_nodes, "anc2"));
		assert.isTrue(_.contains(visited_nodes, "anc1"));
	    });
	});

	describe("get_all_nodes", function () {
	    it ("Returns all the nodes", function () {
		var nodes = mytree.get_all_nodes();
		assert.isArray(nodes);
		assert.lengthOf(nodes, 5);
	    });
	    it ("Does not return collapsed nodes by default", function () {
		var newick_str = "((human, chimp)anc1, mouse)anc2";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.toggle();
		var all_nodes = root.get_all_nodes();
		assert.lengthOf(all_nodes, 1);
	    });
	    it ("Does return collapsed nodes if the deep argument is set", function () {
		var newick_str = "((human, chimp)anc1, mouse)anc2";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.toggle();
		assert.lengthOf(root.get_all_nodes(), 1);
		assert.lengthOf(root.get_all_nodes(true), 5);
	    });
	});

	describe("get_all_leaves", function () {
	    it ("Returns all the leaves", function () {
		var leaves = mytree.get_all_leaves();
		assert.isArray(leaves);
		assert.lengthOf(leaves, 3);
	    });
	    it ("Does not return collapsed leaves by default", function () {
		var newick_str = "((human, chimp)anc1, mouse)anc2";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.toggle();
		assert.lengthOf(root.get_all_leaves(), 1);
		assert.lengthOf(root.get_all_leaves(true), 3);
	    });
	});

	describe("subtree", function () {
	    var subtree;
	    it("Creates subtrees", function () {
		var nodes = [];
		nodes.push(mytree.find_node_by_name('human'));
		nodes.push(mytree.find_node_by_name('mouse'));
		subtree = mytree.subtree(nodes)
		assert.isDefined(subtree);
	    });

	    it("Prunes the tree correctly", function () {
		var ids_in_subtree = [];
		subtree.apply(function (node) {
		    ids_in_subtree.push(node.id());
		});
		assert.isArray(ids_in_subtree);
		assert.lengthOf(ids_in_subtree, 3);
		assert.isTrue(_.contains(ids_in_subtree, 1));
		assert.isTrue(_.contains(ids_in_subtree, 3));
		assert.isTrue(_.contains(ids_in_subtree, 5));
	    });

	    it("Prunes correcly trees that doesn't include the root", function () {
		var nodes = [];
		nodes.push(mytree.find_node_by_name('human'));
		nodes.push(mytree.find_node_by_name('chimp'));
		var subtree = mytree.subtree(nodes);
		assert.isDefined(subtree);
		var ids_in_subtree = [];
		subtree.apply(function (node) {
		    ids_in_subtree.push(node.id());
		});
		assert.isArray(ids_in_subtree);
		assert.lengthOf(ids_in_subtree, 3);
		assert.strictEqual(subtree.id(), 2);
		assert.isTrue(_.contains(ids_in_subtree, 2));
		assert.isTrue(_.contains(ids_in_subtree, 3));
		assert.isTrue(_.contains(ids_in_subtree, 4));
	    });

	    it("Filters singleton nodes by default", function () {
		var newickStr = "(((8,7)4,(6,5)3)2,9)1";
		var origTree = tnt_node(newick.parse_newick(newickStr));
		var isSingleton = function (node) {
		    if (node.children() && node.children().length === 1) {
			return true;
		    }
		    return false;
		};

		// Does not exists singletons in original tree
		assert.strictEqual (origTree.present(isSingleton), false);

		var node8 = origTree.find_node(function (n) {
		    return n.node_name() == 8;
		});
		var node9 = origTree.find_node(function (n) {
		    return n.node_name() == 9;
		});

		// Does not exists singletons in subtree by default
		var subtree = origTree.subtree([node8, node9]);
		assert.isDefined (subtree);
		assert.strictEqual (subtree.present(isSingleton), false);
	    });

	    it ("Keeps singletons if asked for", function () {
		var newickStr = "(((8,7)4,(6,5)3)2,9)1";
		var origTree = tnt_node(newick.parse_newick(newickStr));
		var isSingleton = function (node) {
		    if (node.children() && node.children().length === 1) {
			return true;
		    }
		    return false;
		};
		var node8 = origTree.find_node(function (n) {
		    return n.node_name() == 8;
		});
		var node9 = origTree.find_node(function (n) {
		    return n.node_name() == 9;
		});

		// Does exists singletons in subtree if specified in the second argument
		var subtreeSingletons = origTree.subtree([node8, node9], true);
		assert.isDefined(subtreeSingletons);
		assert.strictEqual (subtreeSingletons.present(isSingleton), true);
	    });

	    it ("Recalculates branch lengths", function () {
		var newickStr = "(((8:0.1,7:0.1)4:0.1,(6:0.1,5:0.1)3:0.1)2:0.1,9:0.1)1:0.1";
		var origTree = tnt_node(newick.parse_newick(newickStr));

		var node8 = origTree.find_node(function (n) {
		    return n.node_name() == 8;
		});
		var node9 = origTree.find_node(function (n) {
		    return n.node_name() == 9;
		});

		var subtree = origTree.subtree([node8, node9], false);
		var newNode8 = subtree.find_node(function (n) {
		    return n.node_name() == 8;
		});
		assert.closeTo(newNode8.property("branch_length"), 0.3, 0.00001)
		
	    });
	    
	    it("Returns an identical copy on a subtree with all the leaves", function () {
		var leaves = mytree.get_all_leaves();
		var subtree = mytree.subtree(leaves);
		assert.isDefined(subtree);
		var tree_nodes = [];
		mytree.apply(function (node) {
		    tree_nodes.push(node);
		});
		var subtree_nodes = [];
		subtree.apply(function (node) {
		    subtree_nodes.push(node);
		});
		assert.strictEqual(tree_nodes.length, subtree_nodes.length);
	    });
	});

	describe("present", function () {
	    it("Returns true if node is present", function () {
		var present = mytree.present(function (node) {
		    return node.id() === 5;
		});
		assert.strictEqual(present, true);
	    });

	    it("Returns false if node is absent", function () {
		var present = mytree.present(function (node) {
		    return node._id === -1;
		});
		assert.strictEqual(present, false);
	    });

	});

	describe("sort", function () {
	    it("Swaps two leaves", function () {
		var ids = [];
		mytree.apply(function (node) {
		    ids.push(node.id());
		});

		// Lets sort
		mytree.sort(function (node1, node2) {
		    if (node1.present(function (n) {
			return n.id() === 5;
		    })) {
			return -1;
		    }
		    if (node2.present(function (n) {
			return n.id() === 5;
		    })) {
			return 1
		    }
		    return 0
		});

		var sorted = [];
		mytree.apply(function (node) {
		    sorted.push(node.id());
		});
		assert.notEqual(ids[1], sorted[1]);
		assert.equal(ids[1], 2);
		assert.equal(sorted[1], 5);
	    });

	    it("Sorts 3 children", function () {
		var newick_str = "((1,2),(6,4,5)anc)";
		var root = tnt_node(newick.parse_newick(newick_str));
		root.sort (function (a, b) {
		    if (a.node_name() > b.node_name()) {
			return 1;
		    }
		    if (a.node_name() < b.node_name()) {
			return -1;
		    }
		    return 0;
		});
		assert.isDefined(root);
		var anc = root.find_node_by_name("anc");
		assert.isDefined(anc);
		var anc_children = anc.children();
		assert.equal(anc_children[0].node_name(), 4);
		assert.equal(anc_children[1].node_name(), 5);
		assert.equal(anc_children[2].node_name(), 6);
	    });

	    it("Sorts based on a numerical value", function () {
		var newick_str = "(((4,2),(5,1)),3)";
		var data = newick.parse_newick(newick_str);
		var tree = tnt_node(data);
		var ids = [];
		tree.apply(function (node) {
		    ids.push(node.id());
		});

		// Helper function to get the lowest value in
		// the subnode -- this is used in the sort cbak
		var get_lowest_val = function (node) {
		    var lowest = 1000;
		    node.apply(function (n) {
			if (n.node_name() === "") {
			    return;
			}
			var val = parseInt(n.node_name());
			if (val < lowest) {
			    lowest = val;
			}
		    });
		    return lowest;
		    };
		
		tree.sort(function (node1, node2) {
		    return get_lowest_val(node1) - get_lowest_val(node2);
		});

		var sorted_ids = [];
		tree.apply(function (node) {
		    sorted_ids.push(node.id());
		});

		assert.operator(_.indexOf(ids, 3), '<', _.indexOf(ids, 6));
		assert.operator(_.indexOf(sorted_ids, 6), '<', _.indexOf(sorted_ids, 3));

		assert.operator(_.indexOf(ids, 7), '<', _.indexOf(ids, 8));
		assert.operator(_.indexOf(sorted_ids, 8), '<', _.indexOf(sorted_ids, 7));

	    });

	});

	describe('flatten', function () {
	    it ("exists", function () {
		assert.isDefined(mytree.flatten);
		assert.isFunction(mytree.flatten);
	    });
	    it ("flattens the root of a tree", function () {
		var flattened = mytree.flatten();
		assert.isDefined(flattened);
		assert.equal(flattened.get_all_leaves().length, 3);
	    });
	    it ("returns a single node without children on flattening leaves", function () {
		var human = mytree.find_node_by_name("human");
		assert.isDefined (human);
		var f = human.flatten();
		assert.isUndefined(f.data().children);
	    });
	    it ("preserves the internal nodes when passed 'true'", function () {
		var mytree = newick.parse_newick ("((human,chimp)anc1,mouse)anc2");
		var flattened = tnt_node(mytree).flatten(true);
		assert.equal(flattened.get_all_leaves().length, 4);
		assert.equal(flattened.get_all_nodes().length, 5);
		assert.isDefined(flattened.find_node_by_name("anc2"));
		assert.isDefined(flattened.find_node_by_name("anc1"));
		var children_names = [];
		var children = flattened.children();
		for (var i=0; i<children.length; i++) {
		    children_names.push (children[i].node_name());
		}
		assert.include(children_names, "anc1");
		assert.notInclude(children_names, "anc2");

	    });
	});


    });

});

