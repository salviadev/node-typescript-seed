const
    _delay = (milliSeconds: number): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => resolve(), milliSeconds)

        });
    }

export const delay = _delay;



