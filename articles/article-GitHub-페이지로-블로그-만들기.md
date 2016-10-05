[//]: # ({"title":"GitHub 페이지로 블로그 만들기","tags":["blog","disqus"],"dateCreated":1475654923030,"dateEdited":null})

# GitHub 페이지로 블로그 만들기
***

GitHub 에서는 '자기아이디.github.io' 라는 이름으로 프로젝트를 생성하고 정적인 웹페이지 컨텐츠를 커밋하면
'https://자기아이디.github.io' 주소로 사이트를 퍼블리싱 해주는 기능을 제공하고 있다.

GitHub 프로젝트 페이지의 'Settings' 에 들어가면 자동으로 HTML 페이지를 생성해주는 기능도 있고,
아니면 [Jekyll](https://jekyllrb.com/)을 이용하여 사이트를 생성하는 방법도 안내하고 있다.

Jekyll을 이용하면 github.io를 블로그처럼 활용할 수 있다고 하는데, 설명을 보니 웬지 설정하는 것도 복잡해 보이고 귀찮아서(?)
아예 그냥 나만의 블로그를 자체 제작해보기로 결정했다.

Javascript와 Ajax를 이용하면 정적이지만 동적인 컨텐츠를 제공하는 페이지를 만들 수 있지 않을까 하는 생각이 들었다.
우선 생노가다로 블로그 글을 HTML로 작성하기는 그러니까 Markdown 으로 작성하고 이를 HTML로 변환하여 보여주게 만들기로 했다.
찾아보니 [markdown-js](https://github.com/evilstreak/markdown-js) 라는 javascript 라이브러리가 있어 이를 이용하기로 했다.
md 파일을 만들어 올리면 페이지가 로딩될 때 Ajax로 md 파일의 내용을 가져와 markdown을 HTML로 변환하여 보여주도록 했다.
또, 아주 간단한 WYSIWYG 방식의 Markdown 편집기도 Javascript로 만들어 넣었다.

페이지 왼쪽 사이드에는 글 목록과 나의 GitHub 프로젝트 목록을 보여줄 수 있게 만들어 보았다.
글 목록은 미리 JSON 형태로 포스팅 한 글들에 대한 정보들을 미리 생성해놓고 역시 Ajax를 이용해 가져와서 목록으로 보여주게 했다.
그 아래에는 GitHub에서 제공하는 API를 이용하여 GitHub에 올려져 있는 개인 프로젝트들을 표시되게 만들었다.

대충 이렇게 만들어 놓으니 블로그 같은 사이트가 만들어졌다.
한가지 블로그로서 부족한게 댓글 기능이 없는게 아쉬웠는데, 어떤 github.io 사이트를 가보니 댓글 기능이 있는 것을 보았다.
살펴보니 [DISQUS](https://disqus.com/) 라는 회사에서 무료로 사용할 수 있는 댓글 기능 플러그인을 이용한 것이었다.
그래서 DISQUS에 가입하고 이 블로그에 붙여보니 훌륭한 댓글 기능을 아주 간단하게 추가할 수 있었다.

PS. 이 블로그의 모든 소스는 [mewlips.github.io](https://github.com/mewlips/mewlips.github.io)에서 보실 수 있습니다.