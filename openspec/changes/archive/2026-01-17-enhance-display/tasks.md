# 任务列表：增强服装和穿搭页面的信息显示

## 任务

### 1. 更新 clothing-management 规范

- [x] 在 `openspec/changes/enhance-display/specs/clothing-management/spec.md` 中添加需求
- [x] 在 "Clothing Item Listing" 需求中添加显示描述和价格的场景

### 2. 更新 outfit-management 规范

- [x] 在 `openspec/changes/enhance-display/specs/outfit-management/spec.md` 中添加/修改需求
- [x] 修改 "Outfit Creation" 需求，明确创建时需要用户提供名字输入
- [x] 修改 "Outfit Listing" 需求，要求显示衣服的详细信息（类别、价格等）

### 3. 修改服装列表页前端

- [x] 修改 `src/app/clothing/page.tsx`
- [x] 在服装卡片中添加描述显示（如果存在）
- [x] 在服装卡片中添加价格显示（如果存在）
- [x] 保持响应式设计，确保信息在小屏幕上也能良好显示

### 4. 修改创建穿搭页前端

- [x] 修改 `src/app/outfits/new/page.tsx`
- [x] 添加名字输入框
- [x] 移除自动生成名字的逻辑
- [x] 添加名字必填验证
- [x] 在创建API调用中使用用户输入的名字

### 5. 修改穿搭API以返回详细信息

- [x] 修改 `src/app/api/outfits/route.ts`（GET方法）
- [x] 在返回outfits时，为每个outfit查询并返回完整的 `clothing_items` 数组
- [x] 每个 `clothing_item` 应包含：id, name, image_path, category_name, price, description
- [x] 确保性能，使用高效的JOIN查询

### 6. 修改穿搭列表页前端

- [x] 修改 `src/app/outfits/page.tsx`
- [x] 使用API返回的完整衣服信息
- [x] 在衣服缩略图下方显示类别名称
- [x] 如果有价格，显示价格信息
- [x] 优化卡片布局，使信息层次清晰

### 7. 验证和测试

- [x] 验证服装列表页正确显示描述和价格
- [x] 验证创建穿搭时名字输入功能正常
- [x] 验证穿搭列表页显示完整的衣服信息
- [x] 测试响应式布局在不同屏幕尺寸下的表现
- [x] 确保所有修改符合规范要求

## 依赖关系

- 任务 1 和 2 可以并行进行（规范更新）
- 任务 3、4、5、6 的实现顺序灵活，但建议先完成API修改（任务5）再修改前端
- 任务 7 需要在所有实现任务完成后进行
