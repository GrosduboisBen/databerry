import { zodResolver } from '@hookform/resolvers/zod';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

type Message = { from: 'human' | 'agent'; message: string; createdAt?: Date };

type Props = {
  messages: Message[];
  onSubmit: (message: string) => Promise<any>;
  messageTemplates?: string[];
  initialMessage?: string;
  readOnly?: boolean;
};

const Schema = z.object({ query: z.string().min(1) });

function ChatBox({
  messages,
  onSubmit,
  messageTemplates,
  initialMessage,
  readOnly,
}: Props) {
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstMsg, setFirstMsg] = useState<Message>();
  const [hideTemplateMessages, setHideTemplateMessages] = useState(false);

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const submit = async ({ query }: z.infer<typeof Schema>) => {
    try {
      setIsLoading(true);
      setHideTemplateMessages(true);
      methods.reset();
      await onSubmit(query);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    scrollableRef.current.scrollTo(0, scrollableRef.current.scrollHeight);
  }, [messages?.length]);

  React.useEffect(() => {
    setTimeout(() => {
      setFirstMsg(
        initialMessage ? { from: 'agent', message: initialMessage } : undefined
      );
    }, 0);
  }, [initialMessage]);

  return (
    <Stack
      direction={'column'}
      gap={2}
      sx={{
        display: 'flex',
        flex: 1,
        flexBasis: '100%',
        maxWidth: '700px',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: '100%',
        mx: 'auto',
      }}
    >
      <Stack
        ref={scrollableRef}
        direction={'column'}
        gap={2}
        sx={{
          boxSizing: 'border-box',
          maxWidth: '100%',
          width: '100%',
          mx: 'auto',
          flex: 1,
          maxHeight: '100%',
          overflowY: 'auto',
          pb: 8,
          pt: 2,
        }}
      >
        {firstMsg && (
          <Card
            size="sm"
            variant={'outlined'}
            color={'primary'}
            className="message-agent"
            sx={{
              mr: 'auto',
              ml: 'none',
              whiteSpace: 'pre-wrap',
            }}
          >
            {firstMsg?.message}
          </Card>
        )}

        {messages.map((each, index) => (
          <Stack
            key={index}
            sx={{
              mr: each.from === 'agent' ? 'auto' : 'none',
              ml: each.from === 'human' ? 'auto' : 'none',
            }}
          >
            <Card
              size="sm"
              variant={'outlined'}
              className={
                each.from === 'agent' ? 'message-agent' : 'message-human'
              }
              color={each.from === 'agent' ? 'primary' : 'neutral'}
              sx={{
                whiteSpace: 'pre-wrap',
                'ul, ol': {
                  listStyleType: 'disc',
                  pl: 2,
                  gap: 1,
                },
                a: {
                  textDecoration: 'underline',
                },
                ['& p']: {
                  m: 0,
                },
                gap: 2,
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>
                {each.message}
              </ReactMarkdown>
            </Card>
          </Stack>
        ))}

        {isLoading && (
          <CircularProgress
            variant="soft"
            color="neutral"
            size="sm"
            sx={{ mx: 'auto', my: 2 }}
          />
        )}
      </Stack>
      {/* </Stack> */}

      {/* <div className="w-full h-12 -translate-y-1/2 pointer-events-none backdrop-blur-lg"></div> */}
      {!readOnly && (
        <form
          style={{
            maxWidth: '100%',
            width: '100%',
            position: 'relative',
            display: 'flex',

            marginTop: 'auto',
            overflow: 'visible',
            background: 'none',
            justifyContent: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
            // paddingLeft: 'inherit',
            // paddingRight: 'inherit',
          }}
          onSubmit={(e) => {
            e.stopPropagation();

            methods.handleSubmit(submit)(e);
          }}
        >
          {!hideTemplateMessages && (messageTemplates?.length || 0) > 0 && (
            <Stack
              direction="row"
              gap={1}
              sx={{
                position: 'absolute',
                zIndex: 1,
                transform: 'translateY(-100%)',
                flexWrap: 'wrap',
                mt: -1,
                left: '0',
              }}
            >
              {messageTemplates?.map((each, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="soft"
                  onClick={() => submit({ query: each })}
                >
                  {each}
                </Button>
              ))}
            </Stack>
          )}

          <Input
            sx={{ width: '100%' }}
            // disabled={!state.currentDatastoreId || state.loading}
            variant="outlined"
            endDecorator={
              <IconButton type="submit" disabled={isLoading}>
                <SendRoundedIcon />
              </IconButton>
            }
            {...methods.register('query')}
          />
        </form>
      )}
    </Stack>
  );
}

export default ChatBox;
