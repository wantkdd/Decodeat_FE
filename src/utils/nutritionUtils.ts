import type { NutritionValue, NutrientCategory } from "../types/nutrition";
import type { ProductDetail } from "../types/productDetail";
import { NUTRITION_LABELS } from "../constants/product";
import { NUTRITION_MAPPING, UNIT_CONVERSION, NUTRIENT_CATEGORIES } from "../constants/nutrition";

/**
 * 제품의 칼로리 정보를 생성합니다.
 *
 * @param product - 제품 상세 정보
 * @returns 칼로리 정보 객체 (name, value, unit) 또는 null
 *
 * @example
 * ```ts
 * const calorieInfo = createCalorieInfo(product);
 * // { name: "칼로리", value: 250, unit: "kcal" }
 * ```
 */
export const createCalorieInfo = (product: ProductDetail) => {
  if (!product || !product.energy) return null;

  const calorieLabel = NUTRITION_LABELS.energy;
  return {
    name: calorieLabel?.label || "칼로리",
    value: product.energy,
    unit: calorieLabel?.unit || "kcal",
  };
};

/**
 * 제품의 영양성분 데이터를 생성하고 단위 변환을 수행합니다.
 * mg 단위는 g 단위로 변환됩니다.
 *
 * @param product - 제품 상세 정보
 * @returns 영양성분 값 배열
 *
 * @example
 * ```ts
 * const nutritionValues = createNutritionValues(product);
 * // [{ key: "protein", value: 10, originalUnit: "g" }, ...]
 * ```
 */
export const createNutritionValues = (product: ProductDetail): NutritionValue[] => {
  return NUTRITION_MAPPING.map(({ key, originalUnit }) => {
    const productValue = product[key as keyof ProductDetail] as number;

    if (originalUnit === "mg") {
      return {
        key,
        value: (productValue || 0) / UNIT_CONVERSION.MG_TO_G,
        originalUnit,
        displayValue: productValue,
      };
    }

    return {
      key,
      value: productValue || 0,
      originalUnit,
    };
  });
};

/**
 * 제품의 세부 영양소를 카테고리별로 그룹화합니다.
 * 빈 카테고리는 필터링됩니다.
 *
 * @param product - 제품 상세 정보
 * @returns 영양소 카테고리 배열
 *
 * @example
 * ```ts
 * const categories = createNutrientCategories(product);
 * // [{ title: "필수 영양소", items: ["비타민 C", "철분"], color: "green", ... }]
 * ```
 */
export const createNutrientCategories = (product: ProductDetail): NutrientCategory[] => {
  return NUTRIENT_CATEGORIES.map(({ key, title, color, textColor, bgColor }) => ({
    title,
    items: (product[key] as string[] | null) || [],
    color,
    textColor,
    bgColor,
  })).filter((category) => category.items.length > 0);
};
