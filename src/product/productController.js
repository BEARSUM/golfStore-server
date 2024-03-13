const productService = require("./productService");
const categoryService = require("../category/categoryService");

const fs = require("fs");

// 상품 생성
const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      images: req.files ? req.files.map((file) => file.path) : [], // 여러 이미지 처리
    };

    const targetCategory = await categoryService.getCategoryById(
      productData.category
    );

    productData.categoryName = targetCategory.categoryName;

    // 카테고리 ID 유효성 검사
    const isValidCategory = await categoryService.isValidCategory(
      productData.category
    );
    if (!isValidCategory) {
      next("유효하지 않은 카테고리입니다.");
      return;
    }

    const product = await productService.createProduct(productData);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // 기존 이미지 paths 저장
    const existingProduct = await productService.getProductById(productId);
    const previousImagePaths = existingProduct.images || [];

    let newImagePaths = [];

    if (req.files && req.files.length > 0) {
      newImagePaths = req.files.map((file) => file.path);
    }

    const productData = {
      ...req.body,
      images: [...previousImagePaths, ...newImagePaths],
    };

    // 카테고리 ID 유효성 검사
    if (productData.category) {
      const isValidCategory = await categoryService.isValidCategory(
        productData.category
      );
      if (!isValidCategory) {
        next("유효하지 않은 카테고리입니다.");
        return;
      }
    }

    // 이미지 파일이 들어왔고, 이전 이미지가 존재한다면 이전 이미지 삭제
    if (req.files && req.files.length > 0 && previousImagePaths.length > 0) {
      // 이전 이미지 삭제 로직 추가
      for (const previousImagePath of previousImagePaths) {
        if (fs.existsSync(previousImagePath)) {
          // 파일 시스템에서 이미지 파일 삭제
          fs.unlink(previousImagePath, (err) => {
            if (err) {
              console.error("이전 이미지 삭제 실패:", err);
            } else {
              console.log("이전 이미지 삭제 성공");
            }
          });
        } else {
          console.log(
            "경고: 이전 이미지가 존재하지 않습니다 -",
            previousImagePath
          );
        }
      }
      // 이미지 배열에 req.files로 받은 이미지로 재 할당
      productData.images = req.files.map((file) => file.path);
    }

    const updatedProduct = await productService.updateProduct(
      productId,
      productData
    );

    res.status(200).json({ updatedProduct });
  } catch (error) {
    next(error);
  }
};

// 상품 삭제
const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const existingProduct = await productService.getProductById(productId);
    const previousImagePaths = existingProduct.images || [];

    const deletedProduct = await productService.deleteProduct(productId);
    if (!deletedProduct) {
      next("존재하지 않는 상품입니다.");
      return;
    }

    // 이전 이미지들 삭제
    if (previousImagePaths.length > 0) {
      for (const imagePath of previousImagePaths) {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        } else {
          console.log(`경고: 파일이 존재하지 않습니다 - ${imagePath}`);
        }
      }
    }

    res.status(200).json({ message: "삭제 완료" });
  } catch (error) {
    next(error);
  }
};

// 모든 상품 삭제
const deleteAllProducts = async (req, res, next) => {
  try {
    // 이미지 폴더 경로
    const imageDirectory = "public/productImages/";

    // 폴더 내의 모든 파일과 폴더 가져오기
    const files = fs.readdirSync(imageDirectory);

    // 파일과 폴더 삭제
    files.forEach((file) => {
      const filePath = imageDirectory + file;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.log(`경고: 파일이 존재하지 않습니다 - ${imagePath}`);
      }
    });

    await productService.deleteAllProducts();
    res.status(200).json({ message: "모든 상품이 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
};

// 상품 조회
const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const product = await productService.getProductById(productId);
    if (!product) {
      next("상품이 존재하지 않습니다.");
      return;
    }
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
};

// 상품 목록 조회
const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

// 상품 검색
const searchProducts = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const products = await productService.searchProducts(keyword);
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteAllProducts,
  getProductById,
  getAllProducts,
  searchProducts,
};
