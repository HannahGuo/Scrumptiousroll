import numpy
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten, BatchNormalization, Activation
from keras.layers.convolutional import Conv2D, MaxPooling2D
from keras.constraints import maxnorm
from keras.utils import np_utils
import pathlib
import tensorflow as tf
from tensorflow.keras import layers
import tensorflowjs as tfjs
import flask
from flask import request, jsonify
import base64
import urllib
from PIL import Image
from io import BytesIO
import numpy as np
from glob import glob
import cv2
from flask_cors import CORS, cross_origin

app = flask.Flask(__name__)

app.config["DEBUG"] = True

def preprocess_and_decode(img_str, new_shape=[256,256]):
    img_str = img_str[23:]
    img = tf.io.decode_base64(img_str)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, new_shape, method=tf.image.ResizeMethod.BILINEAR, preserve_aspect_ratio=False)
    # if you need to squeeze your input range to [0,1] or [-1,1] do it here
    img = tf.keras.preprocessing.image.img_to_array(img)
    img = tf.expand_dims(img, 0) # Create a batch
    return img

@app.route('/api/predict', methods=['POST'])
def api_predict():

    json = request.json
    if 'url' in request.json:
        url = request.json['url']
        url = url.replace("/", "_")
        url = url.replace(' ', '+')
        url = url.replace("+", "-")
    else:
        return "url field not provided."

    # img_path = tf.keras.utils.get_file('img', origin=url)

    # img = tf.keras.preprocessing.image.load_img(
    #     img_path, target_size=(256, 256)
    # )

    # img_array = tf.keras.preprocessing.image.img_to_array(img)
    # img_array = tf.expand_dims(img_array, 0) # Create a batch

    img_array = preprocess_and_decode(url)

    model = tf.keras.models.load_model('./model')

    predictions = model.predict(img_array)
    score = tf.nn.softmax(predictions[0])

    class_names = glob("./dataset/train/*")
    class_names = sorted(class_names)
    map = dict(zip(class_names, score.numpy().tolist()))
    return jsonify(map)

def train():
    data_set = tf.keras.preprocessing.image_dataset_from_directory(
        './dataset/train',
        labels="inferred",
        label_mode="int",
        class_names=None,
        color_mode="rgb",
        batch_size=32,
        image_size=(256, 256),
        shuffle=True,
        seed=None,
        validation_split=None,
        subset=None,
        interpolation="bilinear",
        follow_links=False,
    )

    class_names = data_set.class_names
    print(class_names)

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = data_set.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    normalization_layer = layers.experimental.preprocessing.Rescaling(1./255)
    normalized_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    image_batch, labels_batch = next(iter(normalized_ds))

    num_classes = 10

    model = Sequential([
    layers.experimental.preprocessing.Rescaling(1./255, input_shape=(256, 256, 3)),
    layers.experimental.preprocessing.RandomFlip("horizontal", input_shape=(256, 256, 3)),
    layers.experimental.preprocessing.RandomRotation(0.1),
    layers.experimental.preprocessing.RandomZoom(0.1),
    layers.Conv2D(16, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(32, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(64, 3, padding='same', activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(num_classes)
    ])

    model.compile(optimizer='adam',
                loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                metrics=['accuracy'])

    model.summary()

    epochs=75
    history = model.fit(
    train_ds,
    epochs=epochs
    )

    model.save('model')

    tfjs.converters.save_keras_model(model, './jsmodel')

if __name__ == "__main__":
    app.run()