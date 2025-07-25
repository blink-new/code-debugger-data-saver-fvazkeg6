import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2, Brain, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { blink } from '@/blink/client'
import type { ChatMessage, AISolution, CodeAnalysis } from '@/types'

interface AIChatInterfaceProps {
  onSolutionSelect?: (solution: AISolution) => void
  onCodeAnalysis?: (analysis: CodeAnalysis) => void
}

export function AIChatInterface({ onSolutionSelect, onCodeAnalysis }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI debugging assistant. Describe your error in natural language, and I'll help you find patterns and solutions. Try something like: 'My React app crashes when I click the submit button' or 'Getting a 500 error when calling the API'",
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => prev + ' ' + transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const analyzeErrorWithAI = async (errorDescription: string) => {
    try {
      // Use AI to analyze the error description and generate solutions
      const { text } = await blink.ai.generateText({
        prompt: `Analyze this debugging issue and provide structured solutions:

Error Description: "${errorDescription}"

Please provide:
1. Error categorization and likely causes
2. Step-by-step debugging approach
3. Common solutions for this type of error
4. Code examples if applicable
5. Prevention strategies

Format your response to be helpful for a developer debugging this issue.`,
        maxTokens: 1000
      })

      return text
    } catch (error) {
      console.error('AI analysis failed:', error)
      return 'I apologize, but I encountered an issue analyzing your error. Please try rephrasing your description or check your connection.'
    }
  }

  const searchStackOverflow = async (query: string) => {
    try {
      // Use web search to find relevant Stack Overflow solutions
      const searchResults = await blink.data.search(`site:stackoverflow.com ${query}`, {
        limit: 3
      })

      return searchResults.organic_results?.slice(0, 3).map(result => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: 'Stack Overflow'
      })) || []
    } catch (error) {
      console.error('Stack Overflow search failed:', error)
      return []
    }
  }

  const storeAIInteraction = async (userMessage: ChatMessage, assistantMessage: ChatMessage) => {
    try {
      // Store the pattern for learning
      await blink.db.aiPatterns.create({
        id: `pattern_${Date.now()}`,
        userId: 'current_user',
        patternType: 'error',
        patternData: JSON.stringify({
          userInput: userMessage.content,
          aiResponse: assistantMessage.content,
          confidence: assistantMessage.metadata?.confidence || 0.5
        }),
        frequency: 1,
        confidenceScore: assistantMessage.metadata?.confidence || 0.5,
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to store AI interaction:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Analyze the error with AI
      const aiAnalysis = await analyzeErrorWithAI(input.trim())
      
      // Search for Stack Overflow solutions
      const stackOverflowResults = await searchStackOverflow(input.trim())

      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiAnalysis,
        timestamp: new Date().toISOString(),
        metadata: {
          suggestedSolutions: stackOverflowResults.map((result, index) => ({
            id: `so_${Date.now()}_${index}`,
            userId: 'current_user',
            solutionText: result.snippet,
            solutionType: 'stackoverflow' as const,
            confidenceScore: 0.8,
            successRate: 0.0,
            usageCount: 0,
            sourceUrl: result.url,
            createdAt: new Date().toISOString()
          })),
          confidence: 0.85
        }
      }

      setMessages(prev => [...prev, assistantMessage])

      // Store the interaction for learning
      await storeAIInteraction(userMessage, assistantMessage)

    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again or rephrase your question.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageIcon = (message: ChatMessage) => {
    if (message.type === 'user') return null
    
    const confidence = message.metadata?.confidence || 0
    if (confidence > 0.8) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (confidence > 0.6) return <Lightbulb className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-orange-500" />
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          AI Debugging Assistant
          <Badge variant="secondary" className="ml-auto">
            Learning Mode
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getMessageIcon(message)}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Show Stack Overflow suggestions */}
                      {message.metadata?.suggestedSolutions && message.metadata.suggestedSolutions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Related Stack Overflow Solutions:
                          </p>
                          {message.metadata.suggestedSolutions.map((solution, index) => (
                            <div
                              key={index}
                              className="p-2 bg-white dark:bg-slate-700 rounded border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600"
                              onClick={() => onSolutionSelect?.(solution)}
                            >
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {solution.solutionText}
                              </p>
                              {solution.sourceUrl && (
                                <a
                                  href={solution.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline mt-1 block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View on Stack Overflow →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.metadata?.confidence && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Confidence: {Math.round(message.metadata.confidence * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing your error...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-6 border-t">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your error in natural language... (e.g., 'My React component won't render after state update')"
                className="min-h-[60px] pr-12 resize-none"
                disabled={isLoading}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2"
                onClick={toggleListening}
                disabled={isLoading || !recognitionRef.current}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... Speak your error description
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}