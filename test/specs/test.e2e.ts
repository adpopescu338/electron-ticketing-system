import { browser } from '@wdio/globals'
import { DEFAULT_SYSTEM_SETTINGS } from '@repo/constants'
import { getCurrentItem, swalConfirm, verifyQueueItem, writeIntoSwalInput } from './utils';

const BASE_URL = `http://localhost:${DEFAULT_SYSTEM_SETTINGS.PORT}`;
const QUEUE_1_NAME = 'test-queue';

const openIncognitoWindow = async (path: string) => {
    const handler = await browser.newWindow(BASE_URL + path, {
        windowFeatures: 'toolbar=no, menubar=no, location=no, resizable=no, scrollbars=no, status=no'
    });


    // clear local storage
    await browser.execute(() => {
        window.localStorage.clear()
        window.location.reload()
        window.localStorage.getItem = () => null

    })

    return handler
}

describe('Creates Queue', () => {
    it('should open the home page', async () => {
        expect(
            await $('#home-page-title').getText()
        ).toBe('Queue Settings')
    })

    it('should have 0 queues initially', async () => {
        expect(
            await $$('.queueContainer').length
        ).toBe(0)
    })

    it('should create a new queue', async () => {
        await $('#create-new-queue-button').click()

        expect(
            await browser.getUrl()
        ).toBe(`${BASE_URL}/queue/_new`)

        await $('#queue-name-form-field').setValue(QUEUE_1_NAME)

        await $('button[type="submit"]').click();

        await Promise.all([
            // Wait until the URL changes to the expected value
            browser.waitUntil(
                async () => (await browser.getUrl()) === BASE_URL + '/',
                {
                    timeout: 5000,
                    timeoutMsg: `expected URL to change to ${BASE_URL}/ within 5s`
                }
            ),
            swalConfirm()
        ])

        // check that there's 1 queue now
        expect(
            await $$('.queueContainer').length
        ).toBe(1)

        expect(
            await $('.queue-title').getText()
        ).toBe(QUEUE_1_NAME)
    })
})

describe('Displays queue', () => {
    const verifyThatOnOperatePage = () => $('#next-page-container')
    const clickNextButton = () => $("#next-button").click()
    const writeMessageText = (text: string) => $('#message-input').setValue(text)
    const clickSendMessageButton = () => $('#send-message-button').click()

    let displayerHandler: string;
    it('should open queue display in a new window', async () => {
        // Click the button to open the queue display
        await $(`[data-testid="TvIcon"]`).click();

        // Wait until the new window handle appears
        await browser.waitUntil(
            async () => (await browser.getWindowHandles()).length > 1,
            {
                timeout: 5000,
                timeoutMsg: 'expected second window to open within 5s'
            }
        );


        // Get handles of all open windows
        const handles = await browser.getWindowHandles();
        displayerHandler = handles[1]

        // Switch to the new window
        await browser.switchToWindow(displayerHandler);

        // Check if the new window is in full screen
        const isFullScreen = await browser.execute(() => {
            return 1 >= window.outerHeight - window.innerHeight
        });

        expect(isFullScreen).toBe(true);

        await $('#queue-displayer-wrapper');
        await $(`.queue-display-container`);

        expect(
            await $('.queue-display-title').getText()
        ).toBe(QUEUE_1_NAME)

        // switch back to the original
        await browser.switchToWindow(handles[0]);
    });

    it('opens and operate the queue page', async () => {
        await Promise.all([
            // Verify that the URL changes to /next/${QUEUE_1_NAME}
            browser.waitUntil(
                async () => (await browser.getUrl()) === `${BASE_URL}/next/${QUEUE_1_NAME}`,
                {
                    timeout: 5000,
                    timeoutMsg: `expected URL to change to ${BASE_URL}/next/${QUEUE_1_NAME} within 5s`
                }
            ),
            $(`#queue-open-operation-page-button`).click(),
        ])

        await writeIntoSwalInput('1')

        await swalConfirm()

        await verifyThatOnOperatePage();


        const backIcon = $('[data-testid="ArrowBackIcon"]')

        await backIcon.isClickable()
        await browser.pause(500)

        // navigate back to the home page by clicking the back button
        await Promise.all([
            browser.waitUntil(() => browser.getUrl().then(v => v === `${BASE_URL}/`)),
            backIcon.click(),
        ])
    });

    it('operates queue from 2 windows', async () => {
        const window1Desk = '1'
        const window2Desk = '2'


        const window1Handle = await openIncognitoWindow(`/next/${QUEUE_1_NAME}`);
        // emit the keydown 1 event
        await writeIntoSwalInput(window1Desk)
        await swalConfirm()
        await verifyThatOnOperatePage();


        // Switch to window 2
        const window2Handle =
            await openIncognitoWindow(`/next/${QUEUE_1_NAME}`);
        // emit the keydown 2 event
        await writeIntoSwalInput(window2Desk)
        await swalConfirm()
        await verifyThatOnOperatePage();

        // Switch back to window 1
        await browser.switchToWindow(window1Handle);
        await clickNextButton()
        await browser.switchToWindow(window2Handle)
        await clickNextButton()

        // switch to displayer
        await browser.switchToWindow(displayerHandler);
        await verifyQueueItem(DEFAULT_SYSTEM_SETTINGS.START_NUMBER, window1Desk)
        // TODO: Find a better way to test time based events
        await browser.waitUntil(async () => {
            const { itemNumber } = await getCurrentItem()
            if (itemNumber === String(DEFAULT_SYSTEM_SETTINGS.START_NUMBER + 1)) {
                return true
            }
        }, {
            // some margin of error
            timeout: DEFAULT_SYSTEM_SETTINGS.Q_ITEM_DISPLAY_TIME_SECONDS * 2 * 1000,
            timeoutMsg: 'expected item 2 to be displayed'
        })

        await browser.switchToWindow(window1Handle);

        await writeMessageText('Hello')
        await clickSendMessageButton()

        // switch to displayer
        await browser.switchToWindow(displayerHandler);
        await browser.pause(15_000)
        await browser.waitUntil(async () => {
            const elem = await $('.queue-display-message-container')
            await elem.waitForDisplayed()
            return await elem.getText() === 'Hello'
        })
    })
});

// TODO: Add tests for timing

after(() => {
    // delete all data
    browser.executeAsync((done) => {
        fetch('/api/all', { method: 'DELETE' }).then(done)
    })
    // clear local storage
    browser.execute(() => {
        window.localStorage.clear()
    })
    // close all windows
    browser.closeWindow()
})
