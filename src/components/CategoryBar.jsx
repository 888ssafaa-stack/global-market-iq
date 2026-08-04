import React from 'react';
import { 
  Home, 
  Car, 
  Bike, 
  Zap, 
  Smartphone, 
  Hammer, 
  Wrench, 
  ShoppingBag, 
  Sparkles, 
  Armchair, 
  Utensils,
  LayoutGrid,
  Bed,
  Dog,
  Gem,
  Beef,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';

const ICON_MAP = {
  Home,
  Car,
  Bike,
  Zap,
  Smartphone,
  Hammer,
  Wrench,
  ShoppingBag,
  Sparkles,
  Armchair,
  Utensils,
  Bed,
  Dog,
  Gem,
  Beef,
  GraduationCap,
  MoreHorizontal
};

export default function CategoryBar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="category-bar-wrapper">
      <div className="category-header">
        <div className="category-title">
          <LayoutGrid size={20} color="#1877F2" />
          <span>أقسام السوق ({categories.length} قسم رئيسي)</span>
        </div>
      </div>

      <div className="category-grid">
        {/* زر "الكل" */}
        <button 
          className={`category-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCategory('ALL')}
        >
          <LayoutGrid size={18} />
          <span>كل الأقسام</span>
        </button>

        {/* عرض الأقسام الـ 11 بالكامل */}
        {categories.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || LayoutGrid;
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.id}
              className={`category-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
            >
              <IconComp size={18} color={isSelected ? 'white' : cat.color} />
              <span>{cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
