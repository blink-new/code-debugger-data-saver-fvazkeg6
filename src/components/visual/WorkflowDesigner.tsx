import React, { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Download, 
  Upload,
  Zap,
  Eye,
  AlertTriangle,
  FileText,
  CheckCircle,
  MemoryStick,
  Activity,
  Plus
} from 'lucide-react'
import { blink } from '../../blink/client'
import { DebugWorkflow, WorkflowNode, WorkflowEdge } from '../../types'

// Custom Node Types
const BreakpointNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-red-500 border-2 border-red-600 text-white">
    <div className="flex items-center">
      <AlertTriangle className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">{data.config?.filePath}:{data.config?.lineNumber}</div>
      </div>
    </div>
  </div>
)

const WatchNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-blue-500 border-2 border-blue-600 text-white">
    <div className="flex items-center">
      <Eye className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">{data.config?.variable}</div>
      </div>
    </div>
  </div>
)

const ConditionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-yellow-500 border-2 border-yellow-600 text-white">
    <div className="flex items-center">
      <Zap className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">{data.config?.expression}</div>
      </div>
    </div>
  </div>
)

const LogNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-green-500 border-2 border-green-600 text-white">
    <div className="flex items-center">
      <FileText className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">{data.config?.message}</div>
      </div>
    </div>
  </div>
)

const AssertionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-purple-500 border-2 border-purple-600 text-white">
    <div className="flex items-center">
      <CheckCircle className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">{data.config?.assertion}</div>
      </div>
    </div>
  </div>
)

const MemoryNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-orange-500 border-2 border-orange-600 text-white">
    <div className="flex items-center">
      <MemoryStick className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">Memory Tracking</div>
      </div>
    </div>
  </div>
)

const PerformanceNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-pink-500 border-2 border-pink-600 text-white">
    <div className="flex items-center">
      <Activity className="w-4 h-4 mr-2" />
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs">Performance Monitor</div>
      </div>
    </div>
  </div>
)

const nodeTypes = {
  breakpoint: BreakpointNode,
  watch: WatchNode,
  condition: ConditionNode,
  log: LogNode,
  assertion: AssertionNode,
  memory: MemoryNode,
  performance: PerformanceNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function WorkflowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [savedWorkflows, setSavedWorkflows] = useState<DebugWorkflow[]>([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const getDefaultConfig = useCallback((type: string) => {
    switch (type) {
      case 'breakpoint':
        return { filePath: 'main.js', lineNumber: 1, condition: '' }
      case 'watch':
        return { variable: 'myVariable', scope: 'local' }
      case 'condition':
        return { expression: 'x > 0', action: 'continue' }
      case 'log':
        return { message: 'Debug checkpoint reached', level: 'info' }
      case 'assertion':
        return { assertion: 'result !== null', action: 'throw' }
      case 'memory':
        return { trackHeap: true, trackGC: true }
      case 'performance':
        return { trackCPU: true, trackTime: true }
      default:
        return {}
    }
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowBounds) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          config: getDefaultConfig(type)
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes, getDefaultConfig]
  )

  const loadWorkflows = useCallback(async () => {
    try {
      const user = await blink.auth.me()
      const workflows = await blink.db.debugWorkflows.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      setSavedWorkflows(workflows.map(w => ({
        ...w,
        nodes: JSON.parse(w.nodes || '[]'),
        edges: JSON.parse(w.edges || '[]'),
        viewport: JSON.parse(w.viewport || '{"x":0,"y":0,"zoom":1}')
      })))
    } catch (error) {
      console.error('Error loading workflows:', error)
    }
  }, [])

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const saveWorkflow = useCallback(async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name')
      return
    }

    try {
      const user = await blink.auth.me()
      const viewport = reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 }
      
      const workflow: Omit<DebugWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        name: workflowName,
        description: workflowDescription,
        nodes: nodes as WorkflowNode[],
        edges: edges as WorkflowEdge[],
        viewport
      }

      await blink.db.debugWorkflows.create({
        id: `workflow_${Date.now()}`,
        userId: user.id,
        name: workflowName,
        description: workflowDescription,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        viewport: JSON.stringify(viewport),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      alert('Workflow saved successfully!')
      loadWorkflows()
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Failed to save workflow')
    }
  }, [workflowName, workflowDescription, nodes, edges, reactFlowInstance, loadWorkflows])

  const loadWorkflow = useCallback((workflow: DebugWorkflow) => {
    setNodes(workflow.nodes as Node[])
    setEdges(workflow.edges as Edge[])
    setWorkflowName(workflow.name)
    setWorkflowDescription(workflow.description || '')
    if (reactFlowInstance) {
      reactFlowInstance.setViewport(workflow.viewport)
    }
  }, [setNodes, setEdges, reactFlowInstance])

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    try {
      // Simulate workflow execution
      for (const node of nodes) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Update node status to show execution progress
        setNodes(nds => nds.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, status: 'triggered' } }
            : n
        ))
      }
    } catch (error) {
      console.error('Error executing workflow:', error)
    } finally {
      setIsExecuting(false)
    }
  }, [nodes, setNodes])

  React.useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  return (
    <div className="h-full flex">
      {/* Node Palette */}
      <div className="w-80 bg-slate-900 border-r border-slate-700 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Workflow Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Workflow Designer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Name</label>
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Description</label>
                <Textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe your debugging workflow"
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveWorkflow} size="sm" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={executeWorkflow} disabled={isExecuting} size="sm" className="flex-1">
                  {isExecuting ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isExecuting ? 'Running' : 'Execute'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Node Palette */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Debug Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { type: 'breakpoint', label: 'Breakpoint', icon: AlertTriangle, color: 'bg-red-500' },
                  { type: 'watch', label: 'Watch Variable', icon: Eye, color: 'bg-blue-500' },
                  { type: 'condition', label: 'Condition', icon: Zap, color: 'bg-yellow-500' },
                  { type: 'log', label: 'Log Message', icon: FileText, color: 'bg-green-500' },
                  { type: 'assertion', label: 'Assertion', icon: CheckCircle, color: 'bg-purple-500' },
                  { type: 'memory', label: 'Memory Track', icon: MemoryStick, color: 'bg-orange-500' },
                  { type: 'performance', label: 'Performance', icon: Activity, color: 'bg-pink-500' },
                ].map(({ type, label, icon: Icon, color }) => (
                  <div
                    key={type}
                    className={`${color} text-white p-3 rounded-lg cursor-grab active:cursor-grabbing flex items-center hover:opacity-80 transition-opacity`}
                    onDragStart={(event) => onDragStart(event, type)}
                    draggable
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Workflows */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Saved Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                    onClick={() => loadWorkflow(workflow)}
                  >
                    <div className="text-white font-medium text-sm">{workflow.name}</div>
                    <div className="text-slate-400 text-xs mt-1">
                      {workflow.nodes.length} nodes • {workflow.edges.length} connections
                    </div>
                  </div>
                ))}
                {savedWorkflows.length === 0 && (
                  <div className="text-slate-400 text-sm text-center py-4">
                    No saved workflows yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 bg-slate-950" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-950"
        >
          <Controls className="bg-slate-800 border-slate-700" />
          <MiniMap 
            className="bg-slate-800 border-slate-700" 
            nodeColor="#64748b"
            maskColor="rgba(15, 23, 42, 0.8)"
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#334155"
          />
        </ReactFlow>
      </div>
    </div>
  )
}