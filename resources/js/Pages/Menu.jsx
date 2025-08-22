import React, { useMemo, useState, useCallback, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout.jsx';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';

function buildTree(items) {
    const byParent = new Map();
    items.forEach(it => {
        const p = it.parent_id ?? null;
        if (!byParent.has(p)) byParent.set(p, []);
        byParent.get(p).push(it);
    });
    const attach = (node) => ({
        ...node,
        children: (byParent.get(node.id) || []).map(attach)
    });
    const roots = (byParent.get(null) || []).map(attach);
    return { roots, byParent };
}

function collectSubtree(root, byParent) {
    const attach = (node) => ({
        ...node,
        children: (byParent.get(node.id) || []).map(attach)
    });
    return attach(root);
}

function flatten(nodes) {
    const out = [];
    const walk = (n) => {
        out.push(n);
        (n.children || []).forEach(walk);
    };
    nodes.forEach(walk);
    return out;
}

const NodeRow = ({ node, level, selectedId, onClickNode, onAddChild, onDelete }) => {
    const isSelected = selectedId === node.id;
    return (
        <div className="relative">
            {level > 0 && (
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gray-300"
                    style={{ marginLeft: '-1rem' }}
                />
            )}
            <div
                className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 ring-1 ring-blue-300' : ''
                }`}
                onClick={() => onClickNode(node)}
                title={`Depth: ${node.depth}`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{node.name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="opacity-80 group-hover:opacity-100 text-blue-600 hover:text-blue-800 px-1 py-0.5 rounded shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(node);
                        }}
                        title="Add submenu here"
                    >
                        <Icon icon="mdi:plus-circle-outline" width="18" height="18" />
                    </button>
                    <button
                        type="button"
                        className="opacity-80 group-hover:opacity-100 text-red-600 hover:text-red-800 px-1 py-0.5 rounded shrink-0"
                        onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                        title="Delete menu"
                    >
                        <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TreeNode = ({ node, level = 0, onSelect, onAddChild, onDelete, selectedId, expandedIds, onToggleExpand }) => {
    const hasChildren = node.children && node.children.length > 0;
    const open = expandedIds.has(node.id);

    return (
        <div className="pl-4">
            <div className="flex items-center gap-1 mb-1">
                {hasChildren ? (
                    <button
                        type="button"
                        className="p-0.5 hover:bg-gray-200 rounded shrink-0"
                        onClick={() => onToggleExpand(node.id, !open)}
                        aria-label={open ? 'Collapse' : 'Expand'}
                    >
                        <Icon icon={open ? 'mdi:chevron-down' : 'mdi:chevron-right'} width="18" height="18" />
                    </button>
                ) : (
                    <span className="w-[18px]" />
                )}
                <NodeRow
                    node={node}
                    level={level}
                    selectedId={selectedId}
                    onClickNode={onSelect}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                />
            </div>

            {open && hasChildren && (
                <div className="border-l border-gray-300 ml-2">
                    {node.children.map((c) => (
                        <TreeNode
                            key={c.id}
                            node={c}
                            level={level + 1}
                            onSelect={onSelect}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                            selectedId={selectedId}
                            expandedIds={expandedIds}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Menu = () => {
    const { props } = usePage();
    const { menus = [] } = props;

    const { roots, byParent } = useMemo(() => buildTree(menus), [menus]);

    const [rootId, setRootId] = useState('');
    useEffect(() => {
        if (!rootId && roots.length) setRootId(roots[0].id);
    }, [roots, rootId]);

    const selectedRoot = useMemo(
        () => roots.find((r) => r.id === rootId) ?? roots[0],
        [roots, rootId]
    );

    const subtree = useMemo(() => {
        if (!selectedRoot) return null;
        return collectSubtree(selectedRoot, byParent);
    }, [selectedRoot, byParent]);

    const allInSubtree = useMemo(() => (subtree ? flatten([subtree]) : []), [subtree]);

    const [expandedIds, setExpandedIds] = useState(new Set());

    const [mode, setMode] = useState('create'); // 'create' | 'edit'

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        parent_id: '',
        depth: 0
    });

    const [displayId, setDisplayId] = useState('');

    const setFormForEdit = useCallback((node) => {
        setMode('edit');
        setDisplayId(String(node.id));
        setData({
            name: node.name ?? '',
            parent_id: node.parent_id ?? '',
            depth: Number(node.depth ?? 0)
        });
    }, [setData]);

    // helper isi form untuk CREATE child di bawah parent
    const setFormForCreateChild = useCallback((parent) => {
        setMode('create');
        setDisplayId('');
        setData({
            name: '',
            parent_id: parent?.id ?? '',
            depth: parent ? (Number(parent.depth ?? 0) + 1) : 0
        });
    }, [setData]);

    // klik baris node → edit
    const onSelectNode = useCallback((node) => {
        setFormForEdit(node);
    }, [setFormForEdit]);

    // klik tombol add → create anak
    const onAddChild = useCallback((node) => {
        setFormForCreateChild(node);
    }, [setFormForCreateChild]);

    const onDeleteNode = useCallback((node) => {
        if (!node?.id) return;
        if (confirm(`Delete "${node.name}" and its submenus?`)) {
            router.delete(`/menus/${node.id}`);
        }
    }, []);

    // toggle expand per node
    const onToggleExpand = useCallback((id, nextOpen) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (nextOpen) next.add(id); else next.delete(id);
            return next;
        });
    }, []);

    // Expand All / Collapse All helpers
    const expandAll = useCallback(() => {
        const allIds = new Set((allInSubtree || []).map(n => n.id));
        setExpandedIds(allIds);
    }, [allInSubtree]);

    const collapseAll = useCallback(() => {
        setExpandedIds(new Set());
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (mode === 'create') {
            post('/menus', { preserveScroll: true });
        } else {
            if (!displayId) return;
            put(`/menus/${displayId}`, { preserveScroll: true });
        }
    };

    return (
        <MainLayout>
            <Head title="Menu" />

            {/* root select */}
            <div>
                <label htmlFor="menus" className="block text-sm font-medium mb-1">Menus</label>
                <select
                    id="menus"
                    value={rootId}
                    onChange={(e) => setRootId(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[20%] p-2.5"
                >
                    {roots.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                            {menu.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT: tree dengan connectors */}
                <div className="bg-white rounded-xl border shadow-sm p-3 min-h-[300px]">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm rounded-lg bg-black text-white px-2 py-1 hover:opacity-90"
                            onClick={expandAll}
                            title="Expand all"
                        >
                            <Icon icon="mdi:unfold-more-horizontal" />
                            Expand All
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm rounded-lg bg-white text-gray-800 border px-2 py-1 hover:bg-gray-50"
                            onClick={collapseAll}
                            title="Collapse all"
                        >
                            <Icon icon="mdi:unfold-less-horizontal" />
                            Collapse All
                        </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Menu Tree</h3>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 text-sm rounded-lg border px-2 py-1 hover:bg-gray-50"
                                onClick={() => setFormForCreateChild(null)}
                                title="Add root menu"
                            >
                                <Icon icon="mdi:plus-circle-outline" />
                                Add Root
                            </button>
                        </div>
                    </div>

                    {!subtree ? (
                        <p className="text-sm text-gray-500">No data.</p>
                    ) : (
                        <div className="relative">
                            <TreeNode
                                node={subtree}
                                level={0}
                                onSelect={onSelectNode}
                                onAddChild={onAddChild}
                                onDelete={onDeleteNode}
                                selectedId={mode === 'edit' ? displayId : undefined}
                                expandedIds={expandedIds}
                                onToggleExpand={onToggleExpand}
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT: form */}
                <div className="bg-white rounded-xl border shadow-sm p-4 min-h-[300px]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">
                            {mode === 'create' ? 'Create Menu' : 'Edit Menu'}
                        </h3>
                        {mode === 'edit' && (
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-800"
                                onClick={() => setFormForCreateChild(null)}
                            >
                                + New Root
                            </button>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1">Menu ID</label>
                            <input
                                type="text"
                                value={displayId || 'Auto-generated'}
                                disabled
                                className="w-full rounded-lg border-gray-300 disabled:bg-gray-100"
                            />
                        </div>

                        {/* Depth */}
                        <div>
                            <label className="block text-sm mb-1">Depth</label>
                            <input
                                name="depth"
                                type="number"
                                value={data.depth ?? 0}
                                onChange={(e) => setData('depth', Number(e.target.value || 0))}
                                className="w-full rounded-lg border-gray-300"
                                min={0}
                            />
                            {errors.depth && (<p className="mt-1 text-sm text-red-600">{errors.depth}</p>)}
                        </div>

                        {/* Parent */}
                        <div>
                            <label className="block text-sm mb-1">Parent Data</label>
                            <select
                                name="parent_id"
                                value={data.parent_id ?? ''}
                                onChange={(e) => onParentChange(e.target.value || '')}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">(Root)</option>
                                {allInSubtree.map((n) => (
                                    <option key={n.id} value={n.id}>
                                        {`${'— '.repeat(Number(n.depth ?? 0))}${n.name}`}
                                    </option>
                                ))}
                            </select>
                            {errors.parent_id && (<p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>)}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm mb-1">Name</label>
                            <input
                                name="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border-gray-300"
                                placeholder="Menu name"
                            />
                            {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name}</p>)}
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 w-full text-center disabled:opacity-60"
                            >
                                {processing ? 'Working...' : (mode === 'create' ? 'Save' : 'Update')}
                            </button>

                            {mode === 'edit' && (
                                <button
                                    type="button"
                                    className="rounded-lg bg-gray-100 text-gray-800 px-4 py-2 w-full text-center hover:bg-gray-200"
                                    onClick={() => setFormForCreateChild(null)}
                                >
                                    New
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default Menu;
