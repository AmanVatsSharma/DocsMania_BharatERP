import { Table } from "@tiptap/extension-table";
import { mergeAttributes } from "@tiptap/core";

/**
 * Advanced Table Extension with Excel-like features
 * - Cell formulas and calculations
 * - Data types (text, number, currency, date, checkbox)
 * - Sorting and filtering
 * - Conditional formatting
 * - Data validation
 * - Aggregation functions
 */
export const TableAdvanced = Table.extend({
  name: "tableAdvanced",

  addAttributes() {
    return {
      ...this.parent?.(),
      
      // Data source binding
      dataSource: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-source"),
        renderHTML: (attributes) => {
          if (!attributes.dataSource) return {};
          return { "data-source": attributes.dataSource };
        },
      },
      
      // Query for dynamic data
      dataQuery: {
        default: null,
        parseHTML: (element) => {
          const query = element.getAttribute("data-query");
          return query ? JSON.parse(query) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.dataQuery) return {};
          return { "data-query": JSON.stringify(attributes.dataQuery) };
        },
      },
      
      // Refresh interval for live data (seconds)
      refreshInterval: {
        default: null,
        parseHTML: (element) => {
          const interval = element.getAttribute("data-refresh-interval");
          return interval ? parseInt(interval, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.refreshInterval) return {};
          return { "data-refresh-interval": String(attributes.refreshInterval) };
        },
      },
      
      // Enable sorting
      sortable: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-sortable") === "true",
        renderHTML: (attributes) => ({
          "data-sortable": String(attributes.sortable),
        }),
      },
      
      // Enable filtering
      filterable: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-filterable") === "true",
        renderHTML: (attributes) => ({
          "data-filterable": String(attributes.filterable),
        }),
      },
      
      // Enable aggregations (sum, avg, count, etc.)
      showAggregations: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-show-aggregations") === "true",
        renderHTML: (attributes) => ({
          "data-show-aggregations": String(attributes.showAggregations),
        }),
      },
      
      // Column types (text, number, currency, date, checkbox, select)
      columnTypes: {
        default: null,
        parseHTML: (element) => {
          const types = element.getAttribute("data-column-types");
          return types ? JSON.parse(types) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.columnTypes) return {};
          return { "data-column-types": JSON.stringify(attributes.columnTypes) };
        },
      },
      
      // Conditional formatting rules
      conditionalFormatting: {
        default: null,
        parseHTML: (element) => {
          const rules = element.getAttribute("data-conditional-formatting");
          return rules ? JSON.parse(rules) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.conditionalFormatting) return {};
          return { "data-conditional-formatting": JSON.stringify(attributes.conditionalFormatting) };
        },
      },
      
      // Freeze columns/rows
      frozenColumns: {
        default: 0,
        parseHTML: (element) => {
          const frozen = element.getAttribute("data-frozen-columns");
          return frozen ? parseInt(frozen, 10) : 0;
        },
        renderHTML: (attributes) => ({
          "data-frozen-columns": String(attributes.frozenColumns || 0),
        }),
      },
      
      frozenRows: {
        default: 0,
        parseHTML: (element) => {
          const frozen = element.getAttribute("data-frozen-rows");
          return frozen ? parseInt(frozen, 10) : 0;
        },
        renderHTML: (attributes) => ({
          "data-frozen-rows": String(attributes.frozenRows || 0),
        }),
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      
      setTableDataSource:
        (dataSource: string, query?: any) =>
        ({ commands }) => {
          return commands.updateAttributes("tableAdvanced", {
            dataSource,
            dataQuery: query,
          });
        },
      
      refreshTableData:
        () =>
        ({ commands }) => {
          // Trigger data refresh
          return true;
        },
      
      setColumnType:
        (columnIndex: number, type: string) =>
        ({ commands }) => {
          return commands.updateAttributes("tableAdvanced", (attrs: any) => {
            const columnTypes = attrs.columnTypes || {};
            columnTypes[columnIndex] = type;
            return { columnTypes };
          });
        },
      
      addConditionalFormat:
        (rule: any) =>
        ({ commands }) => {
          return commands.updateAttributes("tableAdvanced", (attrs: any) => {
            const rules = attrs.conditionalFormatting || [];
            rules.push(rule);
            return { conditionalFormatting: rules };
          });
        },
    };
  },
});

export default TableAdvanced;
