'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Clock } from "lucide-react"
import { marked } from 'marked'

interface LikedIdea {
  id: string
  title: string
  content: string
  timestamp: number
  category: string
}

export default function Component() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdea, setGeneratedIdea] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [likedIdeas, setLikedIdeas] = useState<LikedIdea[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [selectedLikedIdea, setSelectedLikedIdea] = useState<LikedIdea | null>(null)

  // 컴포넌트 마운트 시 localStorage에서 좋아요한 아이디어들 로드
  useEffect(() => {
    const savedLikedIdeas = localStorage.getItem('likedIdeas')
    if (savedLikedIdeas) {
      setLikedIdeas(JSON.parse(savedLikedIdeas))
    }
  }, [])

  // 좋아요한 아이디어들이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('likedIdeas', JSON.stringify(likedIdeas))
  }, [likedIdeas])

  // 새 아이디어가 생성될 때마다 좋아요 상태 초기화 및 선택된 아이디어 초기화
  useEffect(() => {
    setIsLiked(false)
    setSelectedLikedIdea(null)
  }, [generatedIdea])

  const handleGenerateIdea = async () => {
    if (!selectedCategory) {
      alert("카테고리를 선택해주세요!")
      return
    }

    setIsGenerating(true)
    setError("")
    setGeneratedIdea("")
    setSelectedLikedIdea(null)
    
    try {
      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('프론트엔드: API 호출 성공', data)
        setGeneratedIdea(data.content)
      } else {
        console.error('API 오류:', data.error)
        setError(data.error || '아이디어 생성 중 오류가 발생했습니다.')
        if (data.fallbackMessage) {
          setError(data.fallbackMessage)
        }
      }
    } catch (error) {
      console.error('네트워크 오류:', error)
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  // 마크다운에서 제목 추출 함수
  const extractTitleFromMarkdown = (markdown: string): string => {
    if (!markdown) return "제목 없음"
    
    // 첫 번째 ## 헤딩 찾기
    const titleMatch = markdown.match(/^##\s+(.+?)$/m)
    if (titleMatch) {
      // 마크다운 서식 제거 (**, __ 등)
      return titleMatch[1].replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1').trim()
    }
    
    // ## 헤딩이 없으면 # 헤딩 찾기
    const h1Match = markdown.match(/^#\s+(.+?)$/m)
    if (h1Match) {
      return h1Match[1].replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1').trim()
    }
    
    // 헤딩이 없으면 첫 번째 줄 사용
    const firstLine = markdown.split('\n')[0].trim()
    return firstLine || "제목 없음"
  }

  // 좋아요 버튼 클릭 핸들러
  const handleLikeIdea = () => {
    if (!generatedIdea || isLiked) return
    
    const title = extractTitleFromMarkdown(generatedIdea)
    const newLikedIdea: LikedIdea = {
      id: Date.now().toString(),
      title: title,
      content: generatedIdea,
      timestamp: Date.now(),
      category: selectedCategory
    }
    
    // 새 아이디어를 맨 앞에 추가하고 10개까지만 유지
    setLikedIdeas(prev => [newLikedIdea, ...prev].slice(0, 10))
    setIsLiked(true)
  }

  // 좋아요한 아이디어 클릭 핸들러
  const handleSelectLikedIdea = (idea: LikedIdea) => {
    console.log('좋아요한 아이디어 클릭:', idea.title)
    setSelectedLikedIdea(idea)
    setGeneratedIdea("")
    setError("")
  }

  // 마크다운을 HTML로 변환
  const renderMarkdown = (content: string) => {
    if (!content) return ""
    return marked(content)
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'startup': '스타트업 아이디어',
      'business-automation': '비즈니스 자동화 아이디어',
      'blog': '블로그 아이디어',
      'youtube': '유튜브 아이디어',
      'project': '프로젝트 아이디어'
    }
    return categoryNames[category] || category
  }

  // 시간 포맷 함수
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return "방금 전"
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  // 현재 표시할 아이디어와 카테고리 결정
  const currentIdea = selectedLikedIdea?.content || generatedIdea
  const currentCategory = selectedLikedIdea?.category || selectedCategory
  const isFromLikedList = !!selectedLikedIdea

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="text-center py-8 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          AI 아이디어 생성기
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          당신의 다음 대박 아이디어, 클릭 한 번이면 됩니다!
        </p>
      </div>

      {/* 메인 컨텐츠 영역 - 2단 레이아웃 */}
      <div className="flex min-h-[calc(100vh-280px)] px-6 pb-8 gap-6">
        
        {/* 왼쪽 영역 - 입력 컨트롤 (40%) */}
        <div className="w-2/5 flex flex-col space-y-6">
          {/* 아이디어 생성 설정 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6">
              <CardTitle className="text-xl font-bold text-center">
                🎯 아이디어 생성 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-medium text-gray-700 block text-left">
                  카테고리를 선택하세요:
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full h-12 text-base text-left">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">스타트업 아이디어</SelectItem>
                    <SelectItem value="business-automation">비즈니스 자동화 아이디어</SelectItem>
                    <SelectItem value="blog">블로그 아이디어</SelectItem>
                    <SelectItem value="youtube">유튜브 아이디어</SelectItem>
                    <SelectItem value="project">프로젝트 아이디어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                onClick={handleGenerateIdea}
                disabled={isGenerating}
                className="w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isGenerating ? "아이디어 생성 중..." : "아이디어 생성"}
              </Button>
            </CardContent>
          </Card>

          {/* Recently Liked Ideas */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm flex-1">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-t-lg p-6">
              <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Recently Liked Ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {likedIdeas.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-center">아직 좋아요한 아이디어가 없습니다.</p>
                  <p className="text-sm mt-1 text-center">아이디어를 생성하고 하트를 눌러보세요!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {likedIdeas.map((idea) => (
                    <div 
                      key={idea.id} 
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md select-none ${
                        selectedLikedIdea?.id === idea.id 
                          ? 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300 ring-2 ring-pink-300' 
                          : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-100 hover:to-rose-100'
                      }`}
                      onClick={() => handleSelectLikedIdea(idea)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectLikedIdea(idea)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 pointer-events-none">
                        <Heart className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight transition-colors text-left">
                            {idea.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                              {getCategoryDisplayName(idea.category)}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(idea.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 사용 팁 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center text-left">
                💡 사용 팁
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="text-left">• 원하는 카테고리를 선택하세요</li>
                <li className="text-left">• AI가 맞춤형 아이디어를 생성합니다</li>
                <li className="text-left">• 마음에 드는 아이디어는 하트를 눌러 저장하세요</li>
                <li className="text-left">• 저장된 아이디어 제목을 클릭하면 다시 볼 수 있습니다</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽 영역 - 결과 표시 (60%) */}
        <div className="w-3/5 flex flex-col">
          
          {/* 오류 메시지 */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-6">
                <p className="text-red-700 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* 생성된 아이디어 또는 선택된 좋아요 아이디어 표시 */}
          {currentIdea && (
            <Card className="shadow-xl border-0 bg-white h-full overflow-hidden">
              <CardHeader className={`text-white p-6 ${
                isFromLikedList 
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-left leading-tight">
                      {isFromLikedList ? '💖' : '✨'} {getCategoryDisplayName(currentCategory)}
                      {isFromLikedList && (
                        <span className="text-lg font-normal ml-2 opacity-90 block mt-1">
                          (저장된 아이디어)
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  {!isFromLikedList && (
                    <div className="flex-shrink-0 ml-4">
                      <Button
                        onClick={handleLikeIdea}
                        disabled={isLiked}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 disabled:opacity-50 px-4 py-2"
                      >
                        <Heart 
                          className={`w-5 h-5 ${isLiked ? 'fill-current text-pink-300' : ''}`} 
                        />
                        <span className="ml-2">
                          {isLiked ? '좋아요 완료!' : '좋아요'}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 h-full overflow-y-auto">
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-headings:text-left prose-p:text-gray-700 prose-p:text-left prose-li:text-gray-700 prose-strong:text-gray-900 prose-ul:text-left prose-ol:text-left"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(currentIdea) 
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* 로딩 중일 때 스켈레톤 */}
          {isGenerating && (
            <Card className="shadow-xl border-0 bg-white h-full">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <CardTitle className="text-2xl font-bold text-center">
                  🔄 아이디어 생성 중...
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="space-y-3 mt-8">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 초기 상태 - 시작 가이드 */}
          {!currentIdea && !isGenerating && !error && (
            <Card className="shadow-xl border-0 bg-white h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  아이디어 생성을 시작해보세요!
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md">
                  왼쪽에서 원하는 카테고리를 선택하고 '아이디어 생성' 버튼을 클릭하거나, 
                  저장된 아이디어 목록에서 제목을 클릭해보세요.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">제공되는 카테고리</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm text-blue-700">
                    <div>📈 스타트업 아이디어</div>
                    <div>⚙️ 비즈니스 자동화</div>
                    <div>📝 블로그 아이디어</div>
                    <div>🎥 유튜브 콘텐츠</div>
                    <div>💻 프로젝트 아이디어</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 페이지 하단 푸터 */}
      <footer className="py-6 px-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            각 아이디어는 AI가 고유하게 생성한 것입니다—완전히 같은 아이디어는 존재하지 않습니다!
          </p>
        </div>
      </footer>
    </div>
  )
}
