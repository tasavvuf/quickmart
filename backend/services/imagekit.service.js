const ImageKit = require("imagekit")

const getImageKitKeys = () => {
  const firstKey = process.env.PK_IMAGEKIT
  const secondKey = process.env.P_IMAGEKIT

  const privateKey = [firstKey, secondKey].find((key) => key?.startsWith("private_")) || firstKey
  const publicKey = [firstKey, secondKey].find((key) => key?.startsWith("public_")) || secondKey

  return { privateKey, publicKey }
}

const getImageKit = () => {
  const { privateKey, publicKey } = getImageKitKeys()

  if (!privateKey || !publicKey) {
    throw new Error("ImageKit public and private keys are required")
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || process.env.URL_ENDPOINT_IMAGEKIT || "https://ik.imagekit.io"
  })
}

const uploadProfilePhoto = async (file, userId) => {
  if (!file) {
    return null
  }

  const extension = file.originalname?.split(".").pop() || "jpg"
  const result = await getImageKit().upload({
    file: file.buffer,
    fileName: `${userId}-${Date.now()}.${extension}`,
    folder: "/HOME/users",
    useUniqueFileName: true
  })

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  }
}

const uploadStorePhoto = async (file, storeOwnerId) => {
  if (!file) {
    return null
  }

  const extension = file.originalname?.split(".").pop() || "jpg"
  const result = await getImageKit().upload({
    file: file.buffer,
    fileName: `${storeOwnerId}-store-${Date.now()}.${extension}`,
    folder: "/HOME/stores",
    useUniqueFileName: true
  })

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  }
}

const uploadDeliveryDocument = async (file, partnerId, docType) => {
  if (!file) {
    return null
  }

  const extension = file.originalname?.split(".").pop() || "jpg"
  const result = await getImageKit().upload({
    file: file.buffer,
    fileName: `${partnerId}-${docType}-${Date.now()}.${extension}`,
    folder: `/HOME/delivery-docs/${partnerId}`,
    useUniqueFileName: true
  })

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  }
}

const uploadProductImage = async (file, storeId) => {
  if (!file) {
    return null
  }

  const extension = file.originalname?.split(".").pop() || "jpg"
  const result = await getImageKit().upload({
    file: file.buffer,
    fileName: `product-${storeId}-${Date.now()}.${extension}`,
    folder: `/HOME/products/${storeId}`,
    useUniqueFileName: true
  })

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  }
}

const uploadStoreLogo = async (file, storeId) => {
  if (!file) {
    return null
  }

  const extension = file.originalname?.split(".").pop() || "jpg"
  const result = await getImageKit().upload({
    file: file.buffer,
    fileName: `logo-${storeId}-${Date.now()}.${extension}`,
    folder: `/HOME/stores/${storeId}`,
    useUniqueFileName: true
  })

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  }
}

const uploadStoreBanner = async (file, storeId) => {
  if (!file) {
    return null
  }

  const extension = file.originalname?.split(".").pop() || "jpg"
  const result = await getImageKit().upload({
    file: file.buffer,
    fileName: `banner-${storeId}-${Date.now()}.${extension}`,
    folder: `/HOME/stores/${storeId}`,
    useUniqueFileName: true
  })

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    thumbnailUrl: result.thumbnailUrl
  }
}

module.exports = {
  uploadProfilePhoto,
  uploadStorePhoto,
  uploadDeliveryDocument,
  uploadProductImage,
  uploadStoreLogo,
  uploadStoreBanner
}

