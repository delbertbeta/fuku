# ui Specification

## MODIFIED Requirements

### Requirement: Root layout language setting

The root layout SHALL use Chinese language attribute with English document title.

#### Scenario: Browser displays page with correct language

Given the application is running
When the root layout renders
Then the HTML lang attribute should be "zh-CN"
And the document title should be "Fuku"
And the meta description should be "管理您的衣橱和穿搭"
