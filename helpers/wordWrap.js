module.exports = function wordwrap(input, width, breakChar = '\n', cut = false) {
    // If input is null or undefined, return an empty string
    if (input == null) {
        return '';
    }

    // If width is not a positive number or the input is empty, return the input as is
    if (isNaN(width) || width <= 0 || input === '') {
        return input;
    }

    // If breakChar is not a string, use the default '\n'
    if (typeof breakChar !== 'string') {
        breakChar = '\n';
    }

    // If cut is not a boolean, use the default false
    cut = Boolean(cut);

    const words = input.split(' ');
    let result = '';
    let line = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const currentLineLength = line.length;

        if (currentLineLength + word.length <= width) {
            // Append the word to the current line
            line += (line === '' ? '' : ' ') + word;
        } else {
            // Start a new line
            if (line !== '') {
                result += line + breakChar;
            }

            // If cut is true, split the word
            if (cut) {
                let remaining = word;
                while (remaining.length > width) {
                    result += remaining.substring(0, width) + breakChar;
                    remaining = remaining.substring(width);
                }
                line = remaining;
            } else {
                line = word;
            }
        }
    }

    if (line !== '') {
        result += line;
    }

    return result;
}
