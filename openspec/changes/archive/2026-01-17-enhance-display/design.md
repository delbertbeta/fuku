# 设计文档：增强服装和穿搭页面的信息显示

## 架构概览

本变更主要涉及前端页面的显示增强和后端API的扩展，不需要重大的架构调整。

## 设计决策

### 1. 前端组件设计

#### 1.1 服装卡片增强

**组件**: `ClothingCard` (可在 `src/app/clothing/page.tsx` 中内联或提取为独立组件)

**布局结构**:

```
┌─────────────────────────┐
│                         │
│      Image (aspect-     │
│      square)            │
│                         │
├─────────────────────────┤
│  Name                   │
│  Category               │  ← 已有
│  Description (optional) │  ← 新增
│  Price (optional)       │  ← 新增
└─────────────────────────┘
```

**样式考虑**:

- 使用 `truncate` 类处理过长的描述文本
- 价格使用不同颜色或加粗样式突出显示
- 响应式布局：在小屏幕上可能需要隐藏或简化描述

#### 1.2 创建穿搭表单增强

**组件**: `OutfitNewPage` (已存在，需修改)

**新增元素**:

- 文本输入框：`<input type="text" name="name" placeholder="输入穿搭名称" required />`
- 验证逻辑：非空验证

**布局顺序**:

1. 返回链接
2. 标题 "创建穿搭"
3. **新增**: 名字输入框
4. 衣服选择列表
5. 创建按钮

#### 1.3 穿搭卡片增强

**组件**: `OutfitCard` (可在 `src/app/outfits/page.tsx` 中内联或提取为独立组件)

**布局结构**:

```
┌─────────────────────────┐
│  Outfit Name            │
│  Description (optional) │
├─────────────────────────┤
│  ┌──────┐ ┌──────┐     │
│  │ Img  │ │ Img  │     │
│  │ Name │ │ Name │     │
│  │ Cat  │ │ Cat  │     │  ← 新增类别
│  │ ¥xx  │ │ ¥xx  │     │  ← 新增价格
│  └──────┘ └──────┘     │
│  [+X more items]        │
└─────────────────────────┘
```

**样式考虑**:

- 类别使用较小的字体，颜色较淡
- 价格使用突出显示（如橙色或红色）
- 网格布局自适应显示衣服数量

### 2. 后端API设计

#### 2.1 GET /api/outfits 增强

**当前行为**:
返回数据结构：

```json
{
  "outfits": [
    {
      "id": 1,
      "name": "Outfit 1",
      "description": "...",
      "clothing_ids": [1, 2, 3]
    }
  ]
}
```

**修改后的行为**:

```json
{
  "outfits": [
    {
      "id": 1,
      "name": "My Outfit",
      "description": "...",
      "clothing_items": [
        {
          "id": 1,
          "name": "Blue T-Shirt",
          "image_path": "/uploads/...",
          "category_name": "上装",
          "price": 29.99,
          "description": "..."
        },
        ...
      ]
    }
  ]
}
```

**SQL查询优化**:

```sql
SELECT o.*, ci.id, ci.name, ci.image_path, ci.price, ci.description, cc.name as category_name
FROM outfits o
LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
LEFT JOIN clothing_items ci ON oi.clothing_id = ci.id
LEFT JOIN clothing_categories cc ON ci.category = cc.id
WHERE o.user_id = ?
ORDER BY o.created_at DESC
```

**后处理**: 在应用层将查询结果按 outfit_id 分组，构建嵌套的数据结构。

### 3. 用户体验考虑

#### 3.1 信息密度平衡

- **服装列表页**: 描述和价格是可选的，不会增加卡片高度太多
- **穿搭列表页**: 类别和价格信息为用户快速识别穿搭提供帮助，但要注意不要使卡片过于拥挤

#### 3.2 响应式设计

- 移动端（<640px）: 可能需要隐藏描述或限制显示长度
- 平板端（640px-1024px）: 正常显示所有信息
- 桌面端（>1024px）: 完整显示所有信息

#### 3.3 性能考虑

- 优化 `/api/outfits` 的SQL查询，避免N+1查询问题
- 考虑添加缓存机制（如果需要）
- 图片使用懒加载（已有）

### 4. 兼容性和迁移

#### 4.1 向后兼容

- API 返回的数据结构变化不影响现有功能
- 前端同时支持 `clothing_ids` 和 `clothing_items` 两个字段（过渡期）
- 数据库结构无需变更

#### 4.2 数据完整性

- 现有穿搭数据自动适配新的API响应格式
- 没有 `price` 或 `description` 的衣服项正常显示（可选字段）

## 技术风险

1. **SQL查询性能**: JOIN 多个表可能影响性能，需要测试大量数据时的表现
   - 缓解措施: 使用适当的索引（已存在），必要时添加分页

2. **前端布局复杂性**: 增加信息可能导致卡片布局不稳定
   - 缓解措施: 使用CSS Grid和Flexbox确保响应式布局，充分测试

3. **API兼容性**: 修改API返回结构可能影响其他调用方
   - 缓解措施: 保持向后兼容，逐步迁移

## 测试策略

1. **单元测试**: 测试API查询逻辑和数据格式化
2. **集成测试**: 测试前后端数据流
3. **视觉回归测试**: 确保UI变化符合预期
4. **性能测试**: 测试大量数据下的API响应时间
5. **响应式测试**: 测试不同屏幕尺寸下的显示效果
