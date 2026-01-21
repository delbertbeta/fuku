## MODIFIED Requirements

### Requirement: Main interface in Chinese

The main application interface SHALL display all UI text in Chinese.

#### Scenario: User sees main navigation in Chinese

Given the user is logged in
When the main page renders
Then the header title should be "Fuku"
And the logout button should display "退出登录"
And the navigation tabs should display "服装", "穿搭", and "日历"
And the loading state should display "加载中..."

#### Scenario: User sees clothing list in Chinese

Given the user is on the clothing tab
When the clothing view renders
Then the section title should be "我的服装"
And the "Add Item" button should display "添加服装"
And the filter buttons should display "全部", "上衣", "外套", "裤子", "鞋子"
And the empty state message should be in Chinese
And the "Back" button should display "← 返回"

#### Scenario: User sees clothing form in Chinese

Given the user is adding a clothing item
When the form renders
Then the form title should be "添加服装"
And the name label should be "名称 _"
And the category label should be "类别 _"
And the category options should be "上衣", "外套", "裤子", "鞋子"
And the description label should be "描述"
And the price label should be "价格"
And the image label should be "图片 \*"
And the submit button should display "保存服装"
And the loading state should display "保存中..."
And error alerts should be in Chinese

#### Scenario: User sees outfits list in Chinese

Given the user is on the outfits tab
When the outfits view renders
Then the section title should be "我的穿搭"
And the "Create Outfit" button should display "创建穿搭"
And the outfit names should be in Chinese format ("穿搭 1", "穿搭 2", etc.)
And the empty state message should be in Chinese
And the create form title should be "创建穿搭"
And the create button should display "创建穿搭 (X 件)"
