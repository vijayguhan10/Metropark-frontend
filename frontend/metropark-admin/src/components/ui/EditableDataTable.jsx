import React, { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { Save, X, Edit2, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

const EditableDataTable = ({ 
  data, 
  columns, 
  onSave, 
  onDelete, 
  onAdd,
  title = "Data Editor",
  keyField = "id",
  keyFields = null, // Array of field names for composite keys
  editable = true,
  deletable = true,
  addable = true
}) => {
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRowValues, setNewRowValues] = useState({});
  
  // Refs to maintain focus on input elements during re-renders
  const editingInputRef = useRef(null);
  const addFormInputRefs = useRef({});
  const tableContainerRef = useRef(null);
  
  // Store scroll position to prevent scroll to top on re-renders
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  
  // Determine the key fields to use (composite or single)
  const effectiveKeyFields = keyFields || [keyField];
  
  // Generate a unique key string for a row
  const getRowKey = useCallback((row) => {
    return effectiveKeyFields.map(field => row[field]).join('|');
  }, [effectiveKeyFields]);
  
  // Check if a row matches a key
  const rowMatchesKey = useCallback((row, key) => {
    const keyParts = key.split('|');
    return effectiveKeyFields.every((field, index) => row[field] === keyParts[index]);
  }, [effectiveKeyFields]);

  // Save scroll position before updates - save both table and window scroll
  const saveScrollPosition = useCallback(() => {
    // Save table container scroll
    if (tableContainerRef.current) {
      scrollPositionRef.current = {
        x: tableContainerRef.current.scrollLeft,
        y: tableContainerRef.current.scrollTop
      };
    }
    // Also save window scroll position as fallback
    scrollPositionRef.current.windowY = window.scrollY;
    scrollPositionRef.current.windowX = window.scrollX;
  }, []);
  
  // Restore scroll position after updates - use useLayoutEffect for synchronous restoration
  const restoreScrollPosition = useCallback(() => {
    // Restore table container scroll
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = scrollPositionRef.current.x;
      tableContainerRef.current.scrollTop = scrollPositionRef.current.y;
    }
    // Restore window scroll if needed
    if (scrollPositionRef.current.windowY !== undefined) {
      window.scrollTo(scrollPositionRef.current.windowX, scrollPositionRef.current.windowY);
    }
  }, []);
  
  // Use useLayoutEffect to restore scroll position synchronously after DOM mutations
  useLayoutEffect(() => {
    restoreScrollPosition();
  }, [editingRow, expandedRows, showAddForm, restoreScrollPosition]);
  
  // Focus the editing input after render - only when editingRow changes
  useEffect(() => {
    if (editingInputRef.current) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        if (editingInputRef.current) {
          editingInputRef.current.focus();
          // Also select the text for better UX
          editingInputRef.current.select();
        }
      }, 0);
    }
  }, [editingRow]);
  
  // Focus first input in add form when it opens
  useEffect(() => {
    if (showAddForm) {
      // Focus first input in add form
      setTimeout(() => {
        const firstInputRef = addFormInputRefs.current[Object.keys(addFormInputRefs.current)[0]];
        if (firstInputRef) {
          firstInputRef.focus();
        }
      }, 0);
    }
  }, [showAddForm]);

  const handleEdit = useCallback((row) => {
    saveScrollPosition();
    const rowKey = getRowKey(row);
    setEditingRow(rowKey);
    setEditValues({ ...row });
  }, [getRowKey, saveScrollPosition]);

  const handleSave = useCallback((row) => {
    saveScrollPosition();
    const rowKey = getRowKey(row);
    onSave(rowKey, editValues);
    setEditingRow(null);
    setEditValues({});
  }, [getRowKey, onSave, editValues, saveScrollPosition]);

  const handleCancel = useCallback(() => {
    saveScrollPosition();
    setEditingRow(null);
    setEditValues({});
  }, [saveScrollPosition]);

  const handleDelete = useCallback((row) => {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      saveScrollPosition();
      const rowKey = getRowKey(row);
      onDelete(rowKey);
    }
  }, [getRowKey, onDelete, saveScrollPosition]);

  const handleAdd = useCallback(() => {
    saveScrollPosition();
    onAdd(newRowValues);
    setShowAddForm(false);
    setNewRowValues({});
  }, [onAdd, newRowValues, saveScrollPosition]);

  const handleInputChange = useCallback((field, value) => {
    if (editingRow) {
      setEditValues(prev => ({ ...prev, [field]: value }));
    } else {
      setNewRowValues(prev => ({ ...prev, [field]: value }));
    }
  }, [editingRow]);

  const toggleRowExpand = useCallback((key) => {
    saveScrollPosition();
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
  }, [saveScrollPosition]);

  const getFieldType = useCallback((column) => {
    if (column.type === 'select' && column.options) return 'select';
    if (column.type === 'number') return 'number';
    if (column.type === 'boolean') return 'boolean';
    return 'text';
  }, []);

  const renderCell = useCallback((row, column) => {
    const value = row[column.field];
    const rowKey = getRowKey(row);
    const isEditing = editingRow === rowKey;
    const fieldType = getFieldType(column);
    
    if (isEditing && editable) {
      if (fieldType === 'select') {
        return (
          <select
            ref={editingInputRef}
            value={editValues[column.field] || ''}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--app-violet)"
          >
            {column.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      }
      
      if (fieldType === 'boolean') {
        return (
          <input
            ref={editingInputRef}
            type="checkbox"
            checked={editValues[column.field] || false}
            onChange={(e) => handleInputChange(column.field, e.target.checked)}
            className="w-4 h-4 text-(--app-violet) border-slate-300 rounded focus:ring-(--app-violet)"
          />
        );
      }
      
      if (fieldType === 'number') {
        return (
          <input
            ref={editingInputRef}
            type="number"
            value={editValues[column.field] || ''}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--app-violet)"
            step={column.step || 'any'}
          />
        );
      }
      
      return (
        <input
          ref={editingInputRef}
          type="text"
          value={editValues[column.field] || ''}
          onChange={(e) => handleInputChange(column.field, e.target.value)}
          className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--app-violet)"
        />
      );
    }
    
    // Display value
    if (column.render) {
      return column.render(value, row);
    }
    
    if (fieldType === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    return <span className="text-sm text-slate-700">{value ?? '-'}</span>;
  }, [editingRow, editable, getRowKey, editValues, getFieldType, handleInputChange]);

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);
  
  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  if (!memoizedData || memoizedData.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
        <p className="mb-2">No data available</p>
        {addable && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-(--app-violet) rounded-lg hover:bg-(--app-violet-strong) transition"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add First Record
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h4 className="font-medium text-slate-900">{title} ({memoizedData.length} records)</h4>
        {addable && !showAddForm && (
          <button
            onClick={() => {
              saveScrollPosition();
              setShowAddForm(true);
              setTimeout(restoreScrollPosition, 0);
            }}
            className="px-3 py-1.5 text-sm font-medium text-(--app-violet) bg-(--app-violet)/5 rounded-lg hover:bg-(--app-violet)/10 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        )}
      </div>

      {/* Add Form */}
      {addable && showAddForm && (
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-h-60 overflow-y-auto">
            {memoizedColumns.map(column => (
              <div key={column.field} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  {column.header}
                </label>
                {getFieldType(column) === 'select' ? (
                  <select
                    ref={(el) => { addFormInputRefs.current[column.field] = el; }}
                    value={newRowValues[column.field] || ''}
                    onChange={(e) => handleInputChange(column.field, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--app-violet)"
                  >
                    <option value="">Select...</option>
                    {column.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : getFieldType(column) === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      ref={(el) => { addFormInputRefs.current[column.field] = el; }}
                      type="checkbox"
                      checked={newRowValues[column.field] || false}
                      onChange={(e) => handleInputChange(column.field, e.target.checked)}
                      className="w-4 h-4 text-(--app-violet) border-slate-300 rounded focus:ring-(--app-violet)"
                    />
                    <span className="text-sm text-slate-700">{column.header}</span>
                  </label>
                ) : (
                  <input
                    ref={(el) => { addFormInputRefs.current[column.field] = el; }}
                    type={getFieldType(column) === 'number' ? 'number' : 'text'}
                    value={newRowValues[column.field] || ''}
                    onChange={(e) => handleInputChange(column.field, e.target.value)}
                    placeholder={column.placeholder || `Enter ${column.header}`}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-(--app-violet)"
                    step={column.step || 'any'}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                saveScrollPosition();
                setShowAddForm(false);
                setNewRowValues({});
                setTimeout(restoreScrollPosition, 0);
              }}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm font-medium text-white bg-(--app-violet) rounded-lg hover:bg-(--app-violet-strong) transition"
            >
              Add Record
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div 
        ref={tableContainerRef}
        className="overflow-x-auto"
        onScroll={saveScrollPosition}
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {memoizedColumns.map(column => (
                <th
                  key={column.field}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {(editable || deletable) && (
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {memoizedData.map((row, index) => {
              const rowKey = getRowKey(row);
              const isEditing = editingRow === rowKey;
              const isExpanded = expandedRows[rowKey];
              
                return (
                  <React.Fragment key={rowKey}>
                    <tr className={`${isEditing ? 'bg-(--app-violet)/5' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} transition-colors`}>
                    {memoizedColumns.map(column => (
                      <td key={column.field} className="px-3 py-2.5">
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {(editable || deletable) && (
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(row)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {editable && (
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="p-1.5 text-slate-500 hover:text-(--app-violet) hover:bg-(--app-violet)/5 rounded transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {deletable && (
                                <button
                                  onClick={() => handleDelete(row)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              {Object.keys(row).length > memoizedColumns.length && (
                                <button
                                  onClick={() => toggleRowExpand(rowKey)}
                                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  
                  {/* Expanded row for additional fields */}
                  {isExpanded && Object.keys(row).length > memoizedColumns.length && (
                    <tr className="bg-slate-50">
                      <td colSpan={memoizedColumns.length + 1} className="p-4">
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                          {Object.entries(row).filter(([key]) => !memoizedColumns.find(c => c.field === key)).map(([key, value]) => (
                            <div key={key} className="p-2 bg-white rounded border border-slate-100">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">{key}</span>
                              <span className="text-slate-700 font-mono text-xs">{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableDataTable;
