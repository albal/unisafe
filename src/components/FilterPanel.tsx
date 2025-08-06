import { Filter, X } from 'lucide-react';
import { FilterState, EquipmentType } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableEquipmentTypes: EquipmentType[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableEquipmentTypes
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      equipmentType: 'all',
      severity: 'all',
      firmwareVersion: '',
      dateRange: 7
    });
  };

  const hasActiveFilters = 
    filters.equipmentType !== 'all' ||
    filters.severity !== 'all' ||
    filters.firmwareVersion !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Equipment Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipment Type
          </label>
          <select
            value={filters.equipmentType}
            onChange={(e) => updateFilter('equipmentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Types</option>
            {availableEquipmentTypes.map(type => (
              <option key={type} value={type}>
                {type.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Level
          </label>
          <select
            value={filters.severity}
            onChange={(e) => updateFilter('severity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>

        {/* Firmware Version Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Firmware Version
          </label>
          <input
            type="text"
            value={filters.firmwareVersion}
            onChange={(e) => updateFilter('firmwareVersion', e.target.value)}
            placeholder="e.g., 7.5.176"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={1}>Last 24 hours</option>
            <option value={3}>Last 3 days</option>
            <option value={7}>Last week</option>
            <option value={14}>Last 2 weeks</option>
            <option value={30}>Last month</option>
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('severity', 'high')}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              filters.severity === 'high'
                ? 'bg-red-100 text-red-700 border-red-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            High Risk Only
          </button>
          <button
            onClick={() => updateFilter('equipmentType', 'router')}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              filters.equipmentType === 'router'
                ? 'bg-primary-100 text-primary-700 border-primary-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            Routers Only
          </button>
          <button
            onClick={() => updateFilter('equipmentType', 'access-point')}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              filters.equipmentType === 'access-point'
                ? 'bg-primary-100 text-primary-700 border-primary-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            Access Points Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
