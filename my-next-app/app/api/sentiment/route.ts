import { NextRequest, NextResponse } from 'next/server';
import { WorkflowService } from '../../../lib/workflow-service';
import { DatabaseService } from '../../../lib/database';
import { CommentAnalysisRequest } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const { comments, analysisType = 'sentiment_analysis' } = await request.json();
    
    if (!Array.isArray(comments)) {
      return NextResponse.json({ error: 'Comments must be an array' }, { status: 400 });
    }
    
    const workflowService = WorkflowService.getInstance();
    const analyzedComments = [];
    
    for (const comment of comments) {
      const startTime = Date.now();
      let analysisResult;
      
      try {
        const commentData: CommentAnalysisRequest = {
          content: comment.content || '-',
          product_name: comment.product_name || '-',
          rating: comment.rating?.toString() || '-',
          user_nick: comment.user_nick || '-',
          date: comment.date || '-',
          sku_info: comment.sku_info || '-',
          useful_count: comment.useful_count?.toString() || '-',
          reply: comment.reply || '-',
          prompt: '-' // prompt字段由工作流内部处理
        };

        if (analysisType === 'sentiment_analysis') {
          analysisResult = await workflowService.analyzeCommentSentiment(commentData);
        } else {
          analysisResult = await workflowService.analyzeCommentBoomReason(commentData);
        }

        const executionTime = Date.now() - startTime;

        // 保存工作流执行记录
        try {
          await DatabaseService.saveWorkflowExecutionLog({
            workflowConfigId: analysisType === 'sentiment_analysis' ? 1 : 2, // 假设sentiment_analysis是1，boom_reason是2
            productId: comment.product_id,
            inputParams: commentData,
            outputResult: analysisResult.success ? analysisResult.data : null,
            executionTimeMs: executionTime,
            success: analysisResult.success,
            errorMessage: analysisResult.success ? undefined : analysisResult.error
          });
        } catch (logError) {
          console.error('Failed to save workflow execution log:', logError);
        }

        // 更新评论的analysis字段，保存完整的AI分析结果
        if (analysisResult.success && analysisResult.data && comment.id) {
          try {
            // 保存完整的分析结果
            await DatabaseService.updateCommentAnalysis(comment.id, analysisResult.data);
            console.log(`Successfully saved analysis for comment ${comment.id}`);
          } catch (updateError) {
            console.error('Failed to update comment analysis:', updateError);
          }
        }

        analyzedComments.push({
          ...comment,
          analysis: analysisResult.success ? analysisResult.data : null,
          analysisError: analysisResult.success ? null : analysisResult.error,
          analysisType
        });

        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        const executionTime = Date.now() - startTime;
        
        // 保存失败的执行记录
        try {
          await DatabaseService.saveWorkflowExecutionLog({
            workflowConfigId: analysisType === 'sentiment_analysis' ? 1 : 2,
            productId: comment.product_id,
            inputParams: {
              content: comment.content || '-',
              product_name: comment.product_name || '-',
              rating: comment.rating?.toString() || '-',
              user_nick: comment.user_nick || '-',
              date: comment.date || '-',
              sku_info: comment.sku_info || '-',
              useful_count: comment.useful_count?.toString() || '-',
              reply: comment.reply || '-',
              prompt: '-'
            },
            outputResult: null,
            executionTimeMs: executionTime,
            success: false,
            errorMessage: error instanceof Error ? error.message : String(error)
          });
        } catch (logError) {
          console.error('Failed to save workflow execution log:', logError);
        }

        analyzedComments.push({
          ...comment,
          analysis: null,
          analysisError: error instanceof Error ? error.message : String(error),
          analysisType
        });
      }
    }
    
    return NextResponse.json({ 
      comments: analyzedComments,
      totalAnalyzed: analyzedComments.length,
      successCount: analyzedComments.filter(c => c.analysis).length,
      errorCount: analyzedComments.filter(c => c.analysisError).length
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Comment Analysis API',
    usage: {
      method: 'POST',
      endpoint: '/api/sentiment',
      body: {
        comments: 'Array of comment objects',
        analysisType: 'sentiment_analysis | boom_reason (optional, default: sentiment_analysis)'
      },
      example: {
        comments: [
          {
            content: '评论内容',
            product_name: '商品名称',
            rating: 8,
            user_nick: '用户昵称',
            date: '2025-01-01',
            sku_info: 'SKU信息',
            useful_count: 5,
            reply: '商家回复'
          }
        ],
        analysisType: 'sentiment_analysis'
      }
    }
  });
}