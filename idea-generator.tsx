'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Clock, Database, RefreshCw, Trash2 } from "lucide-react"
import { marked } from 'marked'
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthUser } from "@/hooks/useAuthUser";

interface FirestoreIdea {
  id: string
  content: string
  category: string
  liked: boolean
  createdAt: any
  userId: string
  userEmail: string
  userDisplayName: string | null
}

export default function Component() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdea, setGeneratedIdea] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLiked, setIsLiked] = useState(false)
  const [selectedFirestoreIdea, setSelectedFirestoreIdea] = useState<FirestoreIdea | null>(null)
  const [firestoreIdeas, setFirestoreIdeas] = useState<FirestoreIdea[]>([])
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false)
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null)
  const { user } = useAuthUser();

  // 새 아이디어가 생성될 때마다 좋아요 상태 초기화 및 선택된 아이디어 초기화
  useEffect(() => {
    setIsLiked(false)
    setSelectedFirestoreIdea(null)
  }, [generatedIdea])

  // 사용자가 로그인했을 때 Firestore 아이디어들 불러오기
  useEffect(() => {
    if (user) {
      loadFirestoreIdeas();
    } else {
      setFirestoreIdeas([]);
    }
  }, [user])

  // Firestore에서 사용자의 아이디어들 불러오기
  const loadFirestoreIdeas = async () => {
    if (!user) {
      console.log("[Firestore] 사용자가 로그인하지 않아 불러오기를 건너뜁니다.");
      return;
    }

    setIsLoadingFirestore(true);
    try {
      const q = query(
        collection(db, "ideas"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const ideas: FirestoreIdea[] = [];
      
      querySnapshot.forEach((doc) => {
        ideas.push({
          id: doc.id,
          ...doc.data()
        } as FirestoreIdea);
      });
      
      setFirestoreIdeas(ideas);
      console.log(`✅ [Firestore] ${ideas.length}개의 아이디어를 불러왔습니다.`);
    } catch (error: any) {
      console.error("❌ [Firestore] 불러오기 오류:", error);
      
      if (error.code === 'permission-denied') {
        console.error("권한 오류: Firestore 보안 규칙을 확인하세요.");
      } else if (error.code === 'failed-precondition') {
        console.error("인덱스가 필요할 수 있습니다. Firebase 콘솔을 확인하세요.");
      }
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  // Firestore에 아이디어 저장 함수
  const saveIdeaToFirestore = async (ideaContent: string, category: string, liked: boolean = false) => {
    // 사용자가 로그인하지 않은 경우 Firestore 저장 건너뛰기
    if (!user) {
      console.log("[Firestore] 사용자가 로그인하지 않아 저장을 건너뜁니다.");
      return null;
    }

    try {
      console.log("[Firestore] 저장 시도", {
        content: ideaContent.substring(0, 100) + "...", // 로그에는 일부만 표시
        category,
        liked,
        userId: user.uid
      });
      
      const docRef = await addDoc(collection(db, "ideas"), {
        content: ideaContent,
        category,
        liked,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        userDisplayName: user.displayName || null
      });
      
      console.log("✅ [Firestore] 저장 성공! 문서 ID:", docRef.id);
      
      // 저장 후 목록 새로고침
      loadFirestoreIdeas();
      return docRef.id;
    } catch (error: any) {
      console.error("❌ [Firestore] 저장 오류:", error);
      
      // 에러 타입별 상세 로깅
      if (error.code === 'permission-denied') {
        console.error("권한 오류: Firestore 보안 규칙을 확인하세요.");
      } else if (error.code === 'unavailable') {
        console.error("서비스 사용 불가: 네트워크 연결을 확인하세요.");
      } else if (error.code === 'failed-precondition') {
        console.error("Firestore 데이터베이스가 생성되지 않았을 수 있습니다.");
      }
      
      return null;
    }
  };

  // Firestore에서 아이디어 삭제 함수
  const deleteIdeaFromFirestore = async (ideaId: string) => {
    if (!user) {
      console.log("[Firestore] 사용자가 로그인하지 않아 삭제를 건너뜁니다.");
      return;
    }

    try {
      console.log("[Firestore] 삭제 시도", { ideaId });
      
      await deleteDoc(doc(db, "ideas", ideaId));
      
      console.log("✅ [Firestore] 삭제 성공! 문서 ID:", ideaId);
      
      // 삭제 후 목록 새로고침
      loadFirestoreIdeas();
    } catch (error: any) {
      console.error("❌ [Firestore] 삭제 오류:", error);
      
      if (error.code === 'permission-denied') {
        console.error("권한 오류: 해당 아이디어를 삭제할 권한이 없습니다.");
      } else if (error.code === 'not-found') {
        console.error("문서를 찾을 수 없습니다.");
      }
    }
  };

  // 삭제 확인 및 실행 함수
  const handleDeleteIdea = async (ideaId: string, ideaTitle: string) => {
    const confirmDelete = window.confirm(`"${ideaTitle}"을(를) 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (confirmDelete) {
      await deleteIdeaFromFirestore(ideaId);
    }
  };

  const handleGenerateIdea = async () => {
    if (!selectedCategory) {
      alert("카테고리를 선택해주세요!")
      return
    }

    setIsGenerating(true)
    setError("")
    setGeneratedIdea("")
    setSelectedFirestoreIdea(null)
    setCurrentIdeaId(null)
    
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
        // Firestore 저장 (생성 시 liked=false) 및 문서 ID 저장
        const docId = await saveIdeaToFirestore(data.content, selectedCategory, false)
        setCurrentIdeaId(docId)
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

  // 저장된 아이디어 클릭 핸들러
  const handleSelectFirestoreIdea = (idea: FirestoreIdea) => {
    console.log('저장된 아이디어 클릭:', extractTitleFromMarkdown(idea.content))
    setSelectedFirestoreIdea(idea)
    setGeneratedIdea("")
    setError("")
    setCurrentIdeaId(idea.id)
    setIsLiked(idea.liked)
  }

  // 좋아요 버튼 클릭 핸들러
  const handleLikeIdea = async () => {
    if (!generatedIdea || isLiked || !currentIdeaId || !user) return
    
    try {
      // Firestore 문서 업데이트
      await updateDoc(doc(db, "ideas", currentIdeaId), {
        liked: true
      });
      
    setIsLiked(true)
      console.log("✅ [Firestore] 좋아요 업데이트 성공! 문서 ID:", currentIdeaId);
      
      // 목록 새로고침
      loadFirestoreIdeas();
    } catch (error: any) {
      console.error("❌ [Firestore] 좋아요 업데이트 오류:", error);
    }
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
  const currentIdea = selectedFirestoreIdea?.content || generatedIdea
  const currentCategory = selectedFirestoreIdea?.category || selectedCategory
  const isFromFirestoreList = !!selectedFirestoreIdea

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

          {/* 나의 아이디어 */}
          {user && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm flex-1">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6">
                <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                  <Database className="w-5 h-5" />
                  나의 아이디어
                  <Button
                    onClick={loadFirestoreIdeas}
                    disabled={isLoadingFirestore}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 ml-2 p-1"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingFirestore ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingFirestore ? (
                  <div className="text-center text-gray-500 py-8">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-spin" />
                    <p className="text-center">클라우드에서 아이디어를 불러오는 중...</p>
                  </div>
                ) : firestoreIdeas.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-center">아직 저장된 아이디어가 없습니다.</p>
                    <p className="text-sm mt-1 text-center">로그인한 상태에서 아이디어를 생성하면 자동으로 저장됩니다!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {firestoreIdeas.map((idea) => (
                      <div 
                        key={idea.id} 
                        className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all hover:shadow-md select-none group"
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-start gap-3">
                          <Database className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                              handleSelectFirestoreIdea(idea);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleSelectFirestoreIdea(idea);
                              }
                            }}
                          >
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight transition-colors text-left">
                              {extractTitleFromMarkdown(idea.content)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                {getCategoryDisplayName(idea.category)}
                              </span>
                              {idea.liked && (
                                <span className="text-xs text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Heart className="w-3 h-3" fill="currentColor" />
                                  Liked
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {idea.createdAt?.toDate ? 
                                  formatTimeAgo(idea.createdAt.toDate().getTime()) : 
                                  '알 수 없음'
                                }
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIdea(idea.id, extractTitleFromMarkdown(idea.content));
                            }}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 p-1 flex-shrink-0"
                            title="아이디어 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                isFromFirestoreList 
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-left leading-tight">
                      {isFromFirestoreList ? '💖' : '✨'} {getCategoryDisplayName(currentCategory)}
                      {isFromFirestoreList && (
                        <span className="text-lg font-normal ml-2 opacity-90 block mt-1">
                          (저장된 아이디어)
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  {!isFromFirestoreList && (
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
