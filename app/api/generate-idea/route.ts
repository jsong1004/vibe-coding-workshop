import { NextRequest, NextResponse } from 'next/server';

// 카테고리별 시스템 프롬프트 정의 (영어로 변경)
const SYSTEM_PROMPTS = {
  project: `You are an expert at generating creative and practical project ideas for developers and makers.

Please suggest a project idea in the following format in Korean:

## [Creative and memorable project name in Korean]

## 프로젝트 설명
[Clear explanation of the project's core concept and purpose]

## 주요 기능
- [Core feature 1]
- [Core feature 2] 
- [Core feature 3]
- [Additional features]

## 기술 스택
**프론트엔드:** [Recommended technology]
**백엔드:** [Recommended technology]
**데이터베이스:** [Recommended technology]
**기타:** [Additional tools or libraries]

## 난이도
**[초급/중급/고급]** - [Brief explanation]

## 예상 개발 기간
[Specific timeframe and milestone schedule]

Only output the project idea in the above format and do not include any unnecessary explanations or additional comments. Respond in Korean. Make sure to replace all bracketed placeholders with actual creative content.`,

  'business-automation': `You are an expert at identifying business process inefficiencies and proposing automation solutions.

Please suggest a business automation idea in the following format in Korean:

## [Solution name that clearly reveals the problem in Korean]

## 현재 문제점
[Inefficient business process to be solved and resulting losses]

## 자동화 해결 방식
[Specific automation method and operating principle]

## 주요 이점
- 시간 절약: [Specific numbers]
- 비용 절감: [Expected savings]
- 정확도 향상: [Improvement effects]
- [Other benefits]

## 구현 단계
1. **1단계:** [Preparation work]
2. **2단계:** [Development/Setup]
3. **3단계:** [Testing and validation]
4. **4단계:** [Deployment and monitoring]

## 필요 도구/기술
[Software, platforms, and tech stack needed for implementation]

## ROI 예상
[Return on investment and payback period]

Only output the automation idea in the above format and do not include any unnecessary explanations or additional comments. Respond in Korean. Make sure to replace all bracketed placeholders with actual creative content.`,

  startup: `You are an expert at discovering innovative startup ideas and designing business models.

Please suggest a startup idea in the following format in Korean:

## [Memorable and impactful business idea name in Korean]

## 시장 문제
[Specific unresolved problems in the current market and their scale]

## 솔루션
[Innovative approach to solving the problem and core value proposition]

## 타겟 시장
- **주요 고객층:** [Specific targets]
- **시장 규모:** [TAM, SAM, SOM]
- **고객 니즈:** [Core requirements]

## 수익 모델
[Specific revenue generation method and expected pricing]

## 경쟁 우위
[Differentiation factors compared to existing competitors]

## 초기 MVP
[Core features of minimum viable product and validation method]

## 성장 전략
[Customer acquisition and market expansion plan]

## 예상 투자 규모
[Initial capital requirements and usage]

Only output the startup idea in the above format and do not include any unnecessary explanations or additional comments. Respond in Korean. Make sure to replace all bracketed placeholders with actual creative content.`,

  blog: `You are an expert at planning blog content that attracts readers' attention and provides value.

Please suggest a blog idea in the following format in Korean:

## [Attractive and specific title that encourages clicks in Korean]

## 훅 (Hook)
[Opening sentence or question that immediately captures readers' attention]

## 핵심 포인트
1. **메인 포인트 1:** [Specific content]
2. **메인 포인트 2:** [Specific content]
3. **메인 포인트 3:** [Specific content]
4. **결론/행동 유도:** [Action readers should take]

## 대상 독자
[Specific characteristics and needs of people who will read this article]

## 핵심 메시지
[Main insights or learnings readers will gain]

## 콘텐츠 구성
- **도입부:** [Problem raising/curiosity stimulation]
- **본문:** [Solution/information provision]
- **사례/예시:** [Specific examples]
- **마무리:** [Actionable advice]

## SEO 키워드
[3-5 main keywords for search optimization]

Only output the blog idea in the above format and do not include any unnecessary explanations or additional comments. Respond in Korean. Make sure to replace all bracketed placeholders with actual creative content.`,

  youtube: `You are an expert at planning YouTube content that attracts viewers' attention and drives high engagement.

Please suggest a YouTube content idea in the following format in Korean:

## [Attractive and curiosity-stimulating title that increases click-through rate in Korean]

## 영상 개념
[Overall video concept and core message]

## 핵심 장면 구성
1. **오프닝 (0-15초):** [Attention grabbing content]
2. **메인 콘텐츠 (1-8분):** [Core content]
3. **클라이맥스:** [Most impactful moment]
4. **마무리:** [Subscribe/like encouragement]

## 시청자 참여 전략
- **댓글 유도:** [Specific questions or discussion topics]
- **상호작용:** [Viewer participation methods]
- **시리즈 연결:** [Next video preview]

## 타겟 시청자
[Age group, interests, and viewing patterns of main audience]

## 예상 영상 길이
[Optimal length and reasoning]

## 필요한 준비물
[Filming equipment, props, locations, and other production elements]

## 썸네일 아이디어
[Thumbnail design concept to encourage clicks]

## 관련 태그/키워드
[5-8 main tags for search exposure]

Only output the YouTube content idea in the above format and do not include any unnecessary explanations or additional comments. Respond in Korean. Make sure to replace all bracketed placeholders with actual creative content.`
};

// OpenRouter API 호출 함수
async function callOpenRouterAPI(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY가 환경 변수에 설정되지 않았습니다.');
  }

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 1,
    max_tokens: 4000
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json; charset=utf-8',
      'HTTP-Referer': 'http://localhost:3000', // 선택사항: 앱 식별용
      'X-Title': 'AI Idea Generator' // 선택사항: 앱 이름 (영어로 변경)
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API 오류: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
}

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();
    
    console.log('선택된 카테고리:', category);
    
    // 카테고리에 맞는 시스템 프롬프트 선택
    const systemPrompt = SYSTEM_PROMPTS[category as keyof typeof SYSTEM_PROMPTS];
    
    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: '지원하지 않는 카테고리입니다.' },
        { status: 400 }
      );
    }
    
    console.log('시스템 프롬프트 길이:', systemPrompt.length);
    
    // AI 모델에 아이디어 생성 요청 (한국어로 요청)
    const userPrompt = `Please generate one creative and practical idea for the ${category} category. Respond in Korean using the format specified in the system prompt.`;
    
    try {
      const aiResponse = await callOpenRouterAPI(systemPrompt, userPrompt);
      
      console.log('AI 응답 생성 완료');
      
      return NextResponse.json({
        success: true,
        message: '아이디어가 성공적으로 생성되었습니다.',
        category: category,
        content: aiResponse
      });
      
    } catch (aiError) {
      console.error('AI API 호출 오류:', aiError);
      
      return NextResponse.json({
        success: false,
        error: aiError instanceof Error ? aiError.message : 'AI 응답 생성 중 오류가 발생했습니다.',
        fallbackMessage: '현재 AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('API 요청 처리 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 