import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

const FilterSidebar = ({ filters, activeFilters, onFilterChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    locations: false,
    farmingPractices: false,
    certifications: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => activeFilters[key] && (Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : true)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <FaTimes className="text-xs" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      {filters.categories && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
          >
            <span>Categories</span>
            {expandedSections.categories ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2">
              {filters.categories.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.categories?.includes(category) || false}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...(activeFilters.categories || []), category]
                        : (activeFilters.categories || []).filter((c) => c !== category);
                      onFilterChange("categories", newCategories);
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      {filters.priceRange && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("priceRange")}
            className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
          >
            <span>Price Range</span>
            {expandedSections.priceRange ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.priceRange && (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
                <input
                  type="number"
                  min={filters.priceRange.min}
                  max={filters.priceRange.max}
                  value={activeFilters.minPrice || filters.priceRange.min}
                  onChange={(e) => onFilterChange("minPrice", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
                <input
                  type="number"
                  min={filters.priceRange.min}
                  max={filters.priceRange.max}
                  value={activeFilters.maxPrice || filters.priceRange.max}
                  onChange={(e) => onFilterChange("maxPrice", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Locations */}
      {filters.locations && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("locations")}
            className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
          >
            <span>Locations</span>
            {expandedSections.locations ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.locations && (
            <div className="space-y-2">
              {filters.locations.map((location) => (
                <label key={location} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.locations?.includes(location) || false}
                    onChange={(e) => {
                      const newLocations = e.target.checked
                        ? [...(activeFilters.locations || []), location]
                        : (activeFilters.locations || []).filter((l) => l !== location);
                      onFilterChange("locations", newLocations);
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{location}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Farming Practices */}
      {filters.farmingPractices && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("farmingPractices")}
            className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
          >
            <span>Farming Practices</span>
            {expandedSections.farmingPractices ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.farmingPractices && (
            <div className="space-y-2">
              {filters.farmingPractices.map((practice) => (
                <label key={practice} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.farmingPractices?.includes(practice) || false}
                    onChange={(e) => {
                      const newPractices = e.target.checked
                        ? [...(activeFilters.farmingPractices || []), practice]
                        : (activeFilters.farmingPractices || []).filter((p) => p !== practice);
                      onFilterChange("farmingPractices", newPractices);
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{practice}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certifications */}
      {filters.certifications && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("certifications")}
            className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
          >
            <span>Certifications</span>
            {expandedSections.certifications ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.certifications && (
            <div className="space-y-2">
              {filters.certifications.map((cert) => (
                <label key={cert} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.certifications?.includes(cert) || false}
                    onChange={(e) => {
                      const newCerts = e.target.checked
                        ? [...(activeFilters.certifications || []), cert]
                        : (activeFilters.certifications || []).filter((c) => c !== cert);
                      onFilterChange("certifications", newCerts);
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{cert}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
