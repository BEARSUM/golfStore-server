const category = require("./categoryModel");

// 카테고리 생성
const createCategory = async (categoryData) => {
  const targetCategory = new category(categoryData);
  return await targetCategory.save();
};

// 카테고리 수정
const updateCategory = async (categoryId, categoryData) => {
  const updatedCategory = await category.findByIdAndUpdate(
    categoryId,
    categoryData,
    { new: true }
  );
  return updatedCategory;
};

// 카테고리 삭제
const deleteCategory = async (categoryId) => {
  return await category.findByIdAndDelete(categoryId);
};

// 카테고리 조회
const getCategoryById = async (categoryId) => {
  return await category.findById(categoryId);
};

// 카테고리 목록 조회
const getAllCategories = async () => {
  return await category.find({});
};

// 카테고리 ID 유효성 검사
const isValidCategory = async (categoryId) => {
  const targetCategory = await category.findById(categoryId);
  return targetCategory ? true : false;
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
  isValidCategory,
};
