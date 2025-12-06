import chalk from 'chalk';
import { logger } from '../../../logger/index.js';
// import { KnowledgeGraph } from '@core/index.js';

/**
 * Tool Result Formatter
 *
 * This utility formats different types of tool results in a visually appealing way
 * for display to the user, replacing the raw JSON output with clean, readable formatting.
 */

interface MemorySearchResult {
	success: boolean;
	query: string;
	error?: string;
	results: Array<{
		id: string;
		text: string;
		tags: string[];
		timestamp: string;
		similarity: number;
		source: string;
		memoryType: string;
		confidence?: number;
		domain?: string;
	}>;
	metadata: {
		totalResults: number;
		searchTime: number;
		maxSimilarity: number;
		minSimilarity: number;
		averageSimilarity: number;
		usedFallback?: boolean;
	};
}

interface KnowledgeGraphResult {
	success: boolean;
	error?: string;
	nodes?: Array<{
		id: string;
		name: string;
		type?: string;
		properties?: Record<string, any>;
		score?: number;
		matchReason?: string;
	}>;
	edges?: Array<{
		id: string;
		type: string;
		source: string;
		target: string;
		properties?: Record<string, any>;
		score?: number;
	}>;
	related?: Array<{
		entity: any;
		relationship: any;
		distance: number;
	}>;
	totalCount?: number;
	executionTime?: number;
	message?: string;
}

interface ReasoningResult {
	success: boolean;
	error?: string;
	steps?: Array<{
		type: string;
		content: string;
	}>;
	evaluation?: {
		qualityScore: number;
		issues: Array<{
			type: string;
			description: string;
			severity?: string;
		}>;
		suggestions: string[];
	};
	trace?: any;
	patterns?: Array<{
		id: string;
		similarity: number;
		context: string;
		steps: Array<{
			type: string;
			content: string;
		}>;
	}>;
}

interface GenericToolResult {
	success?: boolean;
	message?: string;
	error?: string;
	data?: any;
	content?: any; // For MCP tools that use content property
}

/**
 * Format tool results based on tool name and result structure
 */
export function formatToolResult(toolName: string, result: any): string {
	// Handle null/undefined results
	if (!result) {
		return chalk.gray('(no result)');
	}

	// Handle string results
	if (typeof result === 'string') {
		return result;
	}

	// Handle error results (but only for results that don't have specific handlers)
	// We'll let specific handlers deal with their own errors

	// Handle different tool types
	try {
		// Memory search tools
		if (toolName.includes('memory_search') || toolName.includes('search_memory')) {
			return formatMemorySearchResult(result as MemorySearchResult);
		}

		// Knowledge graph search tools
		if (
			toolName.includes('search_graph') ||
			toolName.includes('query_graph') ||
			toolName.includes('get_neighbors')
		) {
			console.log('Knowledge graph result');
			return formatKnowledgeGraphResult(result as KnowledgeGraphResult);
		}

		// Reasoning tools
		if (
			toolName.includes('reasoning') ||
			toolName.includes('extract_reasoning') ||
			toolName.includes('evaluate_reasoning')
		) {
			return formatReasoningResult(result as ReasoningResult);
		}

		// Memory operation tools
		if (toolName.includes('extract_and_operate') || toolName.includes('memory_operation')) {
			return formatMemoryOperationResult(result);
		}

		// Knowledge graph modification tools
		if (
			toolName.includes('add_node') ||
			toolName.includes('add_edge') ||
			toolName.includes('update_node') ||
			toolName.includes('delete_node')
		) {
			return formatKnowledgeGraphModificationResult(result);
		}

		// MCP file tools (read_file, write_file, list_files, etc.)
		if (
			toolName.includes('read_file') ||
			toolName.includes('write_file') ||
			toolName.includes('list_files')
		) {
			return formatMCPFileResult(toolName, result);
		}

		// Generic success/failure result
		return formatGenericResult(result as GenericToolResult);
	} catch (error) {
		logger.debug('Error formatting tool result, falling back to JSON', { error, toolName });
		// If there's an error in the result, show it properly
		if (result && result.error) {
			return chalk.red(`❌ Error: ${result.error}`);
		}
		return JSON.stringify(result, null, 2);
	}
}

/**
 * Format memory search results
 */
function formatMemorySearchResult(result: MemorySearchResult): string {
	if (!result.success) {
		return chalk.red(`❌ Search failed: ${result.error || 'Unknown error'}`);
	}

	const output = [];

	// Header
	output.push(chalk.blue.bold(`🔍 Memory Search Results`));
	output.push(chalk.gray(`Query: "${result.query}"`));
	output.push(
		chalk.gray(`Found ${result.results.length} result(s) in ${result.metadata.searchTime}ms`)
	);
	output.push('');

	// Results
	if (result.results.length === 0) {
		output.push(chalk.yellow('No results found'));
	} else {
		result.results.forEach((item, index) => {
			output.push(
				chalk.cyan(
					`${index + 1}. ${chalk.bold(item.text.substring(0, 80))}${item.text.length > 80 ? '...' : ''}`
				)
			);
			output.push(chalk.gray(`   📊 Similarity: ${(item.similarity * 100).toFixed(1)}%`));
			if (item.confidence) {
				output.push(chalk.gray(`   🎯 Confidence: ${(item.confidence * 100).toFixed(1)}%`));
			}
			if (item.domain) {
				output.push(chalk.gray(`   🏷️  Domain: ${item.domain}`));
			}
			output.push(chalk.gray(`   🏷️  Tags: ${item.tags.join(', ')}`));
			output.push(chalk.gray(`   📅 ${new Date(item.timestamp).toLocaleString()}`));
			output.push('');
		});

		// Summary
		output.push(chalk.gray(`📊 Summary:`));
		output.push(
			chalk.gray(`   • Max similarity: ${(result.metadata.maxSimilarity * 100).toFixed(1)}%`)
		);
		output.push(
			chalk.gray(`   • Min similarity: ${(result.metadata.minSimilarity * 100).toFixed(1)}%`)
		);
		output.push(
			chalk.gray(
				`   • Average similarity: ${(result.metadata.averageSimilarity * 100).toFixed(1)}%`
			)
		);
		if (result.metadata.usedFallback) {
			output.push(chalk.yellow(`   ⚠️  Used fallback search`));
		}
	}

	return output.join('\n');
}

/**
 * Format knowledge graph results
 */
function formatKnowledgeGraphResult(result: KnowledgeGraphResult): string {
	if (!result.success) {
		console.log('Knowledge graph result', result.error);
		return chalk.red(`❌ Graph query failed: ${result.error || 'Unknown error'}`);
	}

	const output = [];

	// Header
	output.push(chalk.blue.bold(`🕸️  Knowledge Graph Results`));
	if (result.message) {
		output.push(chalk.gray(result.message));
	}
	if (result.executionTime) {
		output.push(chalk.gray(`Execution time: ${result.executionTime}ms`));
	}
	output.push('');

	// Nodes
	if (result.nodes && result.nodes.length > 0) {
		output.push(chalk.cyan.bold(`📍 Nodes (${result.nodes.length}):`));
		result.nodes.slice(0, 10).forEach((node, index) => {
			output.push(
				chalk.cyan(
					`  ${index + 1}. ${chalk.bold(node.name)} ${node.type ? chalk.gray(`(${node.type})`) : ''}`
				)
			);
			if (node.score) {
				output.push(chalk.gray(`     📊 Score: ${(node.score * 100).toFixed(1)}%`));
			}
			if (node.matchReason) {
				output.push(chalk.gray(`     🎯 Match: ${node.matchReason}`));
			}
			if (node.properties && Object.keys(node.properties).length > 0) {
				const propStr = Object.entries(node.properties)
					.slice(0, 3)
					.map(([k, v]) => `${k}: ${v}`)
					.join(', ');
				output.push(chalk.gray(`     🏷️  ${propStr}`));
			}
		});
		if (result.nodes.length > 10) {
			output.push(chalk.gray(`  ... and ${result.nodes.length - 10} more`));
		}
		output.push('');
	}

	// Edges
	if (result.edges && result.edges.length > 0) {
		output.push(chalk.magenta.bold(`🔗 Relationships (${result.edges.length}):`));
		result.edges.slice(0, 10).forEach((edge, index) => {
			output.push(
				chalk.magenta(
					`  ${index + 1}. ${chalk.bold(edge.source)} ${chalk.gray('→')} ${chalk.bold(edge.target)}`
				)
			);
			output.push(chalk.gray(`     🏷️  Type: ${edge.type}`));
			if (edge.score) {
				output.push(chalk.gray(`     📊 Score: ${(edge.score * 100).toFixed(1)}%`));
			}
		});
		if (result.edges.length > 10) {
			output.push(chalk.gray(`  ... and ${result.edges.length - 10} more`));
		}
		output.push('');
	}

	// Related entities
	if (result.related && result.related.length > 0) {
		output.push(chalk.yellow.bold(`🔗 Related Entities (${result.related.length}):`));
		result.related.slice(0, 5).forEach((rel, index) => {
			output.push(
				chalk.yellow(
					`  ${index + 1}. ${chalk.bold(rel.entity.name)} ${chalk.gray(`(distance: ${rel.distance})`)}`
				)
			);
			output.push(chalk.gray(`     🔗 via ${rel.relationship.type}`));
		});
		if (result.related.length > 5) {
			output.push(chalk.gray(`  ... and ${result.related.length - 5} more`));
		}
		output.push('');
	}

	// Summary
	if (result.totalCount) {
		output.push(chalk.gray(`📊 Total results: ${result.totalCount}`));
	}

	return output.join('\n');
}

/**
 * Format reasoning results
 */
function formatReasoningResult(result: ReasoningResult): string {
	if (!result.success) {
		return chalk.red(`❌ Reasoning analysis failed: ${result.error || 'Unknown error'}`);
	}

	const output = [];

	// Header
	output.push(chalk.blue.bold(`🧠 Reasoning Analysis`));
	output.push('');

	// Steps
	if (result.steps && result.steps.length > 0) {
		output.push(chalk.cyan.bold(`💭 Reasoning Steps (${result.steps.length}):`));
		result.steps.forEach((step, index) => {
			const typeIcon = getStepTypeIcon(step.type);
			output.push(chalk.cyan(`  ${index + 1}. ${typeIcon} ${chalk.bold(step.type)}`));
			output.push(
				chalk.gray(
					`     ${step.content.substring(0, 100)}${step.content.length > 100 ? '...' : ''}`
				)
			);
		});
		output.push('');
	}

	// Evaluation
	if (result.evaluation) {
		output.push(chalk.yellow.bold(`📊 Quality Evaluation:`));
		output.push(
			chalk.yellow(`  Quality Score: ${(result.evaluation.qualityScore * 100).toFixed(1)}%`)
		);

		if (result.evaluation.issues && result.evaluation.issues.length > 0) {
			output.push(chalk.red(`  Issues Found (${result.evaluation.issues.length}):`));
			result.evaluation.issues.forEach((issue, index) => {
				const severityColor =
					issue.severity === 'high'
						? chalk.red
						: issue.severity === 'medium'
							? chalk.yellow
							: chalk.gray;
				output.push(severityColor(`    ${index + 1}. ${issue.description}`));
			});
		}

		if (result.evaluation.suggestions && result.evaluation.suggestions.length > 0) {
			output.push(chalk.green(`  Suggestions (${result.evaluation.suggestions.length}):`));
			result.evaluation.suggestions.forEach((suggestion, index) => {
				output.push(chalk.green(`    ${index + 1}. ${suggestion}`));
			});
		}
		output.push('');
	}

	// Patterns
	if (result.patterns && result.patterns.length > 0) {
		output.push(chalk.magenta.bold(`🔍 Similar Patterns (${result.patterns.length}):`));
		result.patterns.slice(0, 3).forEach((pattern, index) => {
			output.push(
				chalk.magenta(
					`  ${index + 1}. ${chalk.bold(pattern.context)} ${chalk.gray(`(${(pattern.similarity * 100).toFixed(1)}% match)`)}`
				)
			);
			output.push(chalk.gray(`     ${pattern.steps.length} steps`));
		});
		if (result.patterns.length > 3) {
			output.push(chalk.gray(`  ... and ${result.patterns.length - 3} more`));
		}
		output.push('');
	}

	return output.join('\n');
}

/**
 * Format memory operation results
 */
function formatMemoryOperationResult(result: any): string {
	if (!result.success) {
		return chalk.red(`❌ Memory operation failed: ${result.error || 'Unknown error'}`);
	}

	const output = [];

	// Header
	output.push(chalk.blue.bold(`💾 Memory Operation Results`));
	output.push('');

	// Operations summary
	if (result.operations) {
		const ops = result.operations;
		const summary = [];
		if (ops.added > 0) summary.push(chalk.green(`${ops.added} added`));
		if (ops.updated > 0) summary.push(chalk.yellow(`${ops.updated} updated`));
		if (ops.deleted > 0) summary.push(chalk.red(`${ops.deleted} deleted`));
		if (ops.unchanged > 0) summary.push(chalk.gray(`${ops.unchanged} unchanged`));

		if (summary.length > 0) {
			output.push(chalk.cyan(`📊 Summary: ${summary.join(', ')}`));
			output.push('');
		}
	}

	// Memory entries
	if (result.memories && result.memories.length > 0) {
		output.push(chalk.cyan.bold(`📝 Memory Entries (${result.memories.length}):`));
		result.memories.slice(0, 5).forEach((memory: any, index: number) => {
			const eventIcon = getMemoryEventIcon(memory.event);
			output.push(
				chalk.cyan(
					`  ${index + 1}. ${eventIcon} ${chalk.bold(memory.event)} - ${memory.text.substring(0, 60)}${memory.text.length > 60 ? '...' : ''}`
				)
			);
			if (memory.confidence) {
				output.push(chalk.gray(`     🎯 Confidence: ${(memory.confidence * 100).toFixed(1)}%`));
			}
			if (memory.tags && memory.tags.length > 0) {
				output.push(chalk.gray(`     🏷️  Tags: ${memory.tags.join(', ')}`));
			}
			if (memory.reasoning) {
				output.push(
					chalk.gray(
						`     💭 Reasoning: ${memory.reasoning.substring(0, 80)}${memory.reasoning.length > 80 ? '...' : ''}`
					)
				);
			}
		});
		if (result.memories.length > 5) {
			output.push(chalk.gray(`  ... and ${result.memories.length - 5} more`));
		}
		output.push('');
	}

	return output.join('\n');
}

/**
 * Format knowledge graph modification results
 */
function formatKnowledgeGraphModificationResult(result: any): string {
	if (!result.success) {
		return chalk.red(`❌ Graph modification failed: ${result.error || 'Unknown error'}`);
	}

	const output = [];

	// Header
	output.push(chalk.blue.bold(`🕸️  Knowledge Graph Updated`));
	if (result.message) {
		output.push(chalk.gray(result.message));
	}
	output.push('');

	// Node/Edge details
	if (result.node) {
		output.push(
			chalk.green(
				`✅ Node: ${chalk.bold(result.node.name)} ${result.node.type ? chalk.gray(`(${result.node.type})`) : ''}`
			)
		);
		if (result.node.properties && Object.keys(result.node.properties).length > 0) {
			const propStr = Object.entries(result.node.properties)
				.slice(0, 3)
				.map(([k, v]) => `${k}: ${v}`)
				.join(', ');
			output.push(chalk.gray(`   🏷️  Properties: ${propStr}`));
		}
	}

	if (result.edge) {
		output.push(
			chalk.green(
				`✅ Relationship: ${chalk.bold(result.edge.source)} ${chalk.gray('→')} ${chalk.bold(result.edge.target)}`
			)
		);
		output.push(chalk.gray(`   🏷️  Type: ${result.edge.type}`));
		if (result.edge.properties && Object.keys(result.edge.properties).length > 0) {
			const propStr = Object.entries(result.edge.properties)
				.slice(0, 3)
				.map(([k, v]) => `${k}: ${v}`)
				.join(', ');
			output.push(chalk.gray(`   🏷️  Properties: ${propStr}`));
		}
	}

	// Statistics
	if (result.statistics) {
		output.push('');
		output.push(chalk.gray(`📊 Graph Statistics:`));
		if (result.statistics.totalNodes) {
			output.push(chalk.gray(`   • Total nodes: ${result.statistics.totalNodes}`));
		}
		if (result.statistics.totalEdges) {
			output.push(chalk.gray(`   • Total edges: ${result.statistics.totalEdges}`));
		}
	}

	return output.join('\n');
}

/**
 * Format MCP file tool results
 */
function formatMCPFileResult(toolName: string, result: any): string {
	// Handle explicit errors
	if (result.error) {
		return chalk.red(`❌ ${toolName} failed: ${result.error}`);
	}

	// Handle successful file operations
	if (result.content) {
		const output = [];
		output.push(chalk.green(`✅ ${toolName} completed successfully`));

		if (toolName.includes('read_file') && Array.isArray(result.content)) {
			// For read_file, show content summary
			const textContent = result.content.find((item: any) => item.type === 'text');
			if (textContent && textContent.text) {
				const lines = textContent.text.split('\n').length;
				const chars = textContent.text.length;
				output.push(chalk.gray(`📄 File read: ${lines} lines, ${chars} characters`));
			}
		} else if (toolName.includes('list_files') && Array.isArray(result.content)) {
			// For list_files, show directory contents summary
			const files = result.content.filter((item: any) => item.type === 'file').length;
			const dirs = result.content.filter((item: any) => item.type === 'directory').length;
			output.push(chalk.gray(`📁 Listed: ${files} files, ${dirs} directories`));
		}

		return output.join('\n');
	}

	// For other successful operations
	return chalk.green(`✅ ${toolName} completed successfully`);
}

/**
 * Format generic tool results
 */
function formatGenericResult(result: GenericToolResult): string {
	// Check for explicit failure conditions
	if (result.success === false || result.error) {
		return chalk.red(`❌ ${result.error || result.message || 'Operation failed'}`);
	}

	// For results without explicit success/error properties (like MCP tools),
	// treat them as successful if they contain data
	const hasData = result.data || (result.content && !result.error);
	const isExplicitSuccess = result.success === true;

	if (isExplicitSuccess || hasData) {
		const output = [];

		if (result.data) {
			// Try to format data in a readable way
			if (typeof result.data === 'object' && result.data !== null) {
				const keys = Object.keys(result.data);
				if (keys.length > 0) {
					output.push('');
					output.push(chalk.gray('📄 Data:'));
					keys.slice(0, 5).forEach(key => {
						const value = result.data[key];
						const displayValue = typeof value === 'string' ? value : JSON.stringify(value);
						output.push(
							chalk.gray(
								`   • ${key}: ${displayValue.substring(0, 50)}${displayValue.length > 50 ? '...' : ''}`
							)
						);
					});
					if (keys.length > 5) {
						output.push(chalk.gray(`   ... and ${keys.length - 5} more fields`));
					}
				}
			}
		}

		return output.join('\n');
	}

	// If no clear success/failure indicators, treat as successful
	return chalk.green(`✅ ${result.message || 'Operation completed successfully'}`);
}

/**
 * Get icon for reasoning step type
 */
function getStepTypeIcon(type: string): string {
	switch (type.toLowerCase()) {
		case 'thought':
			return '💭';
		case 'action':
			return '⚡';
		case 'observation':
			return '👁️';
		case 'decision':
			return '🎯';
		case 'conclusion':
			return '🎓';
		case 'reflection':
			return '🪞';
		default:
			return '•';
	}
}

/**
 * Get icon for memory event type
 */
function getMemoryEventIcon(event: string): string {
	switch (event.toUpperCase()) {
		case 'ADD':
			return '➕';
		case 'UPDATE':
			return '✏️';
		case 'DELETE':
			return '🗑️';
		case 'NONE':
			return '⚪';
		default:
			return '•';
	}
}
