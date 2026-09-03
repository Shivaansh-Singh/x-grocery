-- CreateIndex
CREATE INDEX "Product_storeId_isActive_createdAt_idx" ON "Product"("storeId", "isActive", "createdAt");
