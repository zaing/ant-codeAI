import { Controller, Get, Param, Query, Body, Post } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import type { ChatCompletionRequestMessage } from 'openai';
import { EditService } from 'src/edit/edit.service';

@Controller('chatgpt')
export class ChatgptController {
  constructor(
    private readonly chatgptService: ChatgptService,
    private readonly editService: EditService,
  ) {}

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }

  @Get('connect')
  connect(@Query('appKey') appKey) {
    const res = this.chatgptService.connect(appKey);
    if (res) {
      return {
        status: 1,
        data: {
          message: '连接成功',
        },
      };
    }
    return {
      status: 0,
      data: {
        message: '连接失败',
      },
    };
  }
  @Post('generate')
  async generate(@Body() messages: ChatCompletionRequestMessage[]) {
    const res = await this.chatgptService.generate(messages);
    return {
      status: 1,
      data: {
        message: res,
      },
    };
  }

  @Get('getAppKey')
  getAppKey() {
    return this.chatgptService.getAppKey();
  }

  @Get('getPromptList')
  getPromptList() {
    return {
      status: 1,
      data: {
        prompt: this.chatgptService.getPrompt(),
      },
    };
  }

  @Get('getCodePromptList')
  getCodePromptList() {
    return {
      status: 1,
      data: {
        prompt: this.chatgptService.getCodePrompt(),
      },
    };
  }

  @Get('startCodeDocument')
  async startCodeDocument(@Query() query: any) {
    const { promptType, files } = query;
    console.log('*****', query);
    const filesContent = this.editService.getFilesContent(files);
    const codePrompt = this.chatgptService
      .getCodePrompt()
      .find((item) => item.value == promptType);
    const res = await this.chatgptService.startCodeDocument({
      files: filesContent,
      prompt: codePrompt,
    });
    return {
      status: 1,
      data: {
        message: res,
      },
    };
  }
}
